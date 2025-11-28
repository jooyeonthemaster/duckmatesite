require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');

/**
 * HOT 20 아이돌 목록을 페이지에서 직접 추출
 */

async function fetchHotIdols() {
  console.log('═'.repeat(60));
  console.log('🔥 HOT 20 아이돌 추출');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const page = await context.newPage();
  const interceptedData = [];

  // API 응답 가로채기
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api/celeb') || url.includes('api/event') || url.includes('hot')) {
      try {
        const data = await response.json().catch(() => null);
        if (data) {
          interceptedData.push({ url, data });
        }
      } catch (e) {}
    }
  });

  try {
    // 메인 페이지 로드 (완전히)
    console.log('\n📡 메인 페이지 로드 중...');
    await page.goto('https://dukplace.com/ko', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    // HOT 20 섹션 찾기 및 클릭하여 아이돌 정보 추출
    console.log('\n🔍 HOT 20 섹션 분석 중...');

    // 아이돌 카드 클릭 시 네비게이션 URL에서 ID 추출
    const idolCards = await page.$$('.cursor-pointer');
    console.log(`발견된 클릭 가능 요소: ${idolCards.length}개\n`);

    const foundIdols = [];

    // 각 카드를 새 탭에서 열어서 URL 확인
    for (let i = 0; i < Math.min(idolCards.length, 30); i++) {
      const card = idolCards[i];

      try {
        // 카드 정보 추출
        const cardInfo = await card.evaluate(el => {
          const text = el.textContent || '';
          const hasEvent = text.includes('🎉');
          if (!hasEvent) return null;

          const nameEl = el.querySelector('.font-bold');
          const name = nameEl?.textContent?.trim().split('\n')[0] || '';
          const groupEl = el.querySelector('[class*="bg-main-pink"]');
          const group = groupEl?.textContent?.trim() || '';

          // 이벤트 수 추출
          const eventMatch = text.match(/(\d+)\s*🎉/);
          const eventCount = eventMatch ? parseInt(eventMatch[1]) : 0;

          return { name, group, eventCount };
        });

        if (!cardInfo || cardInfo.eventCount === 0) continue;

        // 카드 클릭하여 URL 확인 (새 탭에서)
        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: 5000 }),
          card.click({ modifiers: ['Control'] }) // Ctrl+클릭 = 새 탭
        ]).catch(() => [null]);

        if (newPage) {
          await newPage.waitForLoadState('domcontentloaded').catch(() => {});
          const url = newPage.url();

          // URL에서 아이돌 ID 추출
          const idMatch = url.match(/\/list\/(\d+)/);
          if (idMatch) {
            const id = parseInt(idMatch[1]);
            foundIdols.push({
              id,
              ...cardInfo
            });
            console.log(`✅ ${cardInfo.name} (${cardInfo.group}) - ID: ${id}, Events: ${cardInfo.eventCount}`);
          }

          await newPage.close();
        }
      } catch (e) {
        // 에러 무시
      }
    }

    // Ctrl+클릭이 안 되면 일반 클릭 시도
    if (foundIdols.length === 0) {
      console.log('\n⚠️ Ctrl+클릭 실패, 직접 네비게이션 시도...\n');

      // 페이지 새로고침
      await page.goto('https://dukplace.com/ko', {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      await page.waitForTimeout(2000);

      // 카드 다시 찾기
      const cards = await page.$$('.cursor-pointer');

      for (let i = 0; i < Math.min(cards.length, 30); i++) {
        const card = cards[i];

        try {
          const cardInfo = await card.evaluate(el => {
            const text = el.textContent || '';
            if (!text.includes('🎉')) return null;

            const nameEl = el.querySelector('.font-bold');
            const name = nameEl?.textContent?.trim().split('\n')[0] || '';
            const groupEl = el.querySelector('[class*="bg-main-pink"]');
            const group = groupEl?.textContent?.trim() || '';
            const eventMatch = text.match(/(\d+)\s*🎉/);
            const eventCount = eventMatch ? parseInt(eventMatch[1]) : 0;

            return { name, group, eventCount };
          });

          if (!cardInfo || cardInfo.eventCount === 0) continue;

          // 현재 URL 저장
          const currentUrl = page.url();

          // 카드 클릭
          await card.click();
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});

          const newUrl = page.url();
          const idMatch = newUrl.match(/\/list\/(\d+)/);

          if (idMatch) {
            const id = parseInt(idMatch[1]);
            // 중복 체크
            if (!foundIdols.some(idol => idol.id === id)) {
              foundIdols.push({ id, ...cardInfo });
              console.log(`✅ ${cardInfo.name} (${cardInfo.group}) - ID: ${id}, Events: ${cardInfo.eventCount}`);
            }
          }

          // 뒤로가기
          await page.goBack();
          await page.waitForLoadState('networkidle').catch(() => {});
          await page.waitForTimeout(500);
        } catch (e) {
          // 에러 시 페이지 새로고침
          await page.goto('https://dukplace.com/ko', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        }
      }
    }

    // 가로챈 API 데이터 분석
    if (interceptedData.length > 0) {
      console.log('\n📦 가로챈 API 데이터 분석...');
      for (const item of interceptedData) {
        if (Array.isArray(item.data)) {
          console.log(`  ${item.url.split('?')[0]}: ${item.data.length}개 항목`);
          item.data.slice(0, 3).forEach(d => {
            if (d.id && d.name) {
              console.log(`    - ID ${d.id}: ${d.name}`);
              if (!foundIdols.some(idol => idol.id === d.id)) {
                foundIdols.push({
                  id: d.id,
                  name: d.name,
                  group: d.groupName || d.group?.name || '',
                  eventCount: d.eventCount || 0
                });
              }
            }
          });
        }
      }
    }

    // 결과 정리 및 저장
    console.log('\n' + '═'.repeat(60));
    console.log(`📊 추출 완료: ${foundIdols.length}명`);
    console.log('═'.repeat(60));

    // 이벤트 수 기준 정렬
    foundIdols.sort((a, b) => b.eventCount - a.eventCount);

    foundIdols.forEach((idol, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ID ${idol.id}: ${idol.name} (${idol.group}) - ${idol.eventCount}개`);
    });

    if (foundIdols.length > 0) {
      fs.writeFileSync(
        './src/data/hot_idols.json',
        JSON.stringify(foundIdols, null, 2),
        'utf-8'
      );
      console.log('\n💾 저장됨: src/data/hot_idols.json');
    }

    return foundIdols;

  } finally {
    await browser.close();
  }
}

fetchHotIdols().catch(console.error);
