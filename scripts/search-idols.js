require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 검색을 통해 특정 아이돌의 ID 찾기
 */

// HOT 20에서 확인된 아이돌 목록
const TARGET_IDOLS = [
  { name: '명재현', group: '보이넥스트도어', expectedEvents: 63 },
  { name: '수빈', group: '투모로우바이투게더', expectedEvents: 17 },
  { name: '성훈', group: '엔하이픈', expectedEvents: 13 },
  { name: '도영', group: '트레저', expectedEvents: 17 },
  { name: '영케이', group: '데이식스', expectedEvents: 15 },
  { name: '진', group: '방탄소년단', expectedEvents: 11 },
  { name: '장한음', group: '보이즈II플래닛', expectedEvents: 13 },
  { name: '재찬', group: '디케이지', expectedEvents: 12 },
  { name: '김지웅', group: '제로베이스원', expectedEvents: 12 },
  { name: '조슈아', group: '세븐틴', expectedEvents: 9 },
  { name: '강다니엘', group: '', expectedEvents: 5 },
  { name: '서영은', group: '케플러', expectedEvents: 5 },
  { name: '찬열', group: '엑소', expectedEvents: 1 },
  { name: '승관', group: '세븐틴', expectedEvents: 5 },
];

async function searchIdols() {
  console.log('═'.repeat(60));
  console.log('🔍 아이돌 검색으로 ID 찾기');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const foundIdols = [
    // 이미 알고 있는 ID
    { id: 65, name: '운학', group: '보이넥스트도어', eventCount: 71 },
    { id: 570, name: '이민혁', group: '비투비', eventCount: 4 },
  ];

  try {
    const page = await context.newPage();

    console.log('\n📡 검색 페이지에서 아이돌 ID 추출 중...\n');

    for (const idol of TARGET_IDOLS) {
      const searchQuery = `${idol.name} ${idol.group}`.trim();
      process.stdout.write(`🔎 "${idol.name}" 검색 중...`);

      try {
        // 검색 페이지로 이동
        await page.goto(`https://dukplace.com/ko/search?q=${encodeURIComponent(idol.name)}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });

        await page.waitForTimeout(1500);

        // 검색 결과에서 아이돌 이벤트 링크 찾기
        const result = await page.evaluate((targetName, targetGroup) => {
          // events/list 링크 찾기
          const links = document.querySelectorAll('a[href*="/events/list/"]');
          for (const link of links) {
            const href = link.href;
            const match = href.match(/\/list\/(\d+)/);
            if (match) {
              // 해당 링크 주변의 텍스트에서 아이돌 이름 확인
              const container = link.closest('[class*="cursor-pointer"]') || link.parentElement;
              const text = container?.textContent || '';

              if (text.includes(targetName)) {
                return { id: parseInt(match[1]), href };
              }
            }
          }

          // 또는 클릭 가능한 카드에서 찾기
          const cards = document.querySelectorAll('[class*="cursor-pointer"]');
          for (const card of cards) {
            const text = card.textContent || '';
            if (text.includes(targetName)) {
              // 카드 내 링크 확인
              const innerLink = card.querySelector('a[href*="/events/list/"]');
              if (innerLink) {
                const match = innerLink.href.match(/\/list\/(\d+)/);
                if (match) return { id: parseInt(match[1]), href: innerLink.href };
              }
            }
          }

          return null;
        }, idol.name, idol.group);

        if (result) {
          foundIdols.push({
            id: result.id,
            name: idol.name,
            group: idol.group,
            eventCount: idol.expectedEvents
          });
          console.log(` ✅ ID: ${result.id}`);
        } else {
          // 검색 결과 클릭해서 ID 찾기
          const clickResult = await page.evaluate((targetName) => {
            const cards = document.querySelectorAll('[class*="cursor-pointer"], [class*="rounded-xl"]');
            for (const card of cards) {
              const text = card.textContent || '';
              if (text.includes(targetName) && text.includes('🎉')) {
                return true;
              }
            }
            return false;
          }, idol.name);

          if (clickResult) {
            // 카드 클릭
            const card = await page.$(`text=${idol.name}`);
            if (card) {
              await card.click();
              await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});

              const url = page.url();
              const idMatch = url.match(/\/list\/(\d+)/);
              if (idMatch) {
                foundIdols.push({
                  id: parseInt(idMatch[1]),
                  name: idol.name,
                  group: idol.group,
                  eventCount: idol.expectedEvents
                });
                console.log(` ✅ ID: ${idMatch[1]}`);
              } else {
                console.log(' ⚠️ ID 미발견');
              }
            } else {
              console.log(' ⚠️ 카드 클릭 실패');
            }
          } else {
            console.log(' ⚠️ 검색 결과 없음');
          }
        }
      } catch (err) {
        console.log(` ❌ 에러: ${err.message.slice(0, 30)}`);
      }
    }

    // 결과 정리
    console.log('\n' + '═'.repeat(60));
    console.log(`📊 추출 완료: ${foundIdols.length}명`);
    console.log('═'.repeat(60));

    // 중복 제거 및 정렬
    const uniqueIdols = Array.from(new Map(foundIdols.map(i => [i.id, i])).values());
    uniqueIdols.sort((a, b) => b.eventCount - a.eventCount);

    uniqueIdols.forEach((idol, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ID ${idol.id}: ${idol.name} (${idol.group}) - ${idol.eventCount}개`);
    });

    // 저장
    fs.writeFileSync(
      './src/data/idol_list.json',
      JSON.stringify(uniqueIdols, null, 2),
      'utf-8'
    );
    console.log('\n💾 저장됨: src/data/idol_list.json');

    return uniqueIdols;

  } finally {
    await browser.close();
  }
}

searchIdols().catch(console.error);
