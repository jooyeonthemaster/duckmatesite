const { chromium } = require('playwright');

/**
 * HOT 20 아이돌 ID 추출 스크립트 v2
 * 네트워크 요청 모니터링 + 직접 URL 탐색
 */

async function findIdolIds() {
  console.log('🔍 HOT 20 아이돌 ID 추출 중...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const page = await context.newPage();
  const apiCalls = [];

  // 네트워크 요청 모니터링
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('celeb') || url.includes('idol') || url.includes('hot')) {
      try {
        const data = await response.json().catch(() => null);
        if (data) {
          apiCalls.push({ url, data });
        }
      } catch (e) {}
    }
  });

  try {
    // 메인 페이지 로드
    await page.goto('https://dukplace.com/ko', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    console.log(`📡 API 호출 ${apiCalls.length}개 감지됨`);
    apiCalls.forEach((call, i) => {
      console.log(`  ${i + 1}. ${call.url.slice(0, 80)}...`);
    });

    // RSC 데이터에서 추출 시도
    const rscData = await page.evaluate(() => {
      // __NEXT_DATA__ 확인
      const nextScript = document.getElementById('__NEXT_DATA__');
      if (nextScript) {
        return { type: 'NEXT_DATA', data: JSON.parse(nextScript.textContent) };
      }

      // RSC payload 확인
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.textContent?.includes('celebs') || script.textContent?.includes('idols')) {
          return { type: 'script', data: script.textContent.slice(0, 500) };
        }
      }

      return null;
    });

    if (rscData) {
      console.log('\n📦 페이지 데이터 발견:', rscData.type);
    }

    // HOT 20 섹션 찾아서 각 아이돌 카드의 링크 추출
    console.log('\n🔗 아이돌 카드 링크 추출 중...');

    // a 태그나 클릭 이벤트가 있는 요소에서 href 추출
    const idolLinks = await page.evaluate(() => {
      const results = [];

      // 모든 링크 확인
      document.querySelectorAll('a[href*="events/list"]').forEach(a => {
        const match = a.href.match(/\/list\/(\d+)/);
        if (match) {
          const id = match[1];
          const text = a.textContent?.trim().slice(0, 50);
          results.push({ id, text, href: a.href });
        }
      });

      return results;
    });

    console.log(`  a 태그 링크: ${idolLinks.length}개`);

    // 없으면 검색 페이지 시도
    if (idolLinks.length === 0) {
      console.log('\n🔍 검색 페이지에서 추출 시도...');

      // 생일 근처 아이돌 검색
      await page.goto('https://dukplace.com/ko/place/events/search', {
        waitUntil: 'networkidle',
        timeout: 30000
      }).catch(() => {});

      await page.waitForTimeout(2000);

      const searchLinks = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('a[href*="events/list"]').forEach(a => {
          const match = a.href.match(/\/list\/(\d+)/);
          if (match) {
            results.push({ id: match[1], href: a.href });
          }
        });
        return results;
      });

      console.log(`  검색 페이지 링크: ${searchLinks.length}개`);
    }

    // 알려진 아이돌 ID로 직접 크롤링 (HTML에서 추출한 이름 기반)
    console.log('\n📋 알려진 아이돌 목록으로 ID 탐색...');

    // HOT 20에서 볼 수 있는 아이돌 이름들
    const knownIdols = [
      { name: '운학', group: '보이넥스트도어' },
      { name: '명재현', group: '보이넥스트도어' },
      { name: '수빈', group: '투모로우바이투게더' },
      { name: '성훈', group: '엔하이픈' },
      { name: '도영', group: '트레저' },
      { name: '영케이', group: '데이식스' },
      { name: '진', group: '방탄소년단' },
      { name: '장한음', group: '보이즈II플래닛' },
      { name: '재찬', group: '디케이지' },
      { name: '김지웅', group: '제로베이스원' },
    ];

    // 각 아이돌 검색하여 ID 찾기
    const foundIdols = [];

    for (const idol of knownIdols) {
      // 검색 페이지에서 이름으로 검색
      await page.goto(`https://dukplace.com/ko/place/events/search?q=${encodeURIComponent(idol.name)}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      }).catch(() => {});

      await page.waitForTimeout(1000);

      // 검색 결과에서 ID 추출
      const result = await page.evaluate((idolName) => {
        // 이벤트 리스트 링크 찾기
        const link = document.querySelector('a[href*="events/list"]');
        if (link) {
          const match = link.href.match(/\/list\/(\d+)/);
          if (match) return { id: parseInt(match[1]) };
        }

        // 또는 이벤트 카드에서 찾기
        const eventCard = document.querySelector('[id^="event-"]');
        if (eventCard) {
          // 이벤트 상세 링크에서 추출
          const detailLink = eventCard.querySelector('a[href*="events/detail"]');
          if (detailLink) {
            return { detailUrl: detailLink.href };
          }
        }

        return null;
      }, idol.name);

      if (result?.id) {
        foundIdols.push({ ...idol, id: result.id });
        console.log(`  ✅ ${idol.name} (${idol.group}) - ID: ${result.id}`);
      } else {
        console.log(`  ⚠️ ${idol.name} - ID 미발견`);
      }
    }

    // 결과 저장
    const fs = require('fs');

    if (foundIdols.length > 0) {
      const outputPath = './src/data/idol_list.json';
      fs.writeFileSync(outputPath, JSON.stringify(foundIdols, null, 2), 'utf-8');
      console.log(`\n💾 ${foundIdols.length}명 저장됨: ${outputPath}`);
    }

    return foundIdols;

  } finally {
    await browser.close();
  }
}

findIdolIds().catch(console.error);
