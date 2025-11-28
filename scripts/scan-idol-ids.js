require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 넓은 범위의 아이돌 ID를 스캔하여 이벤트가 있는 아이돌 찾기
 */

async function scanIdolIds() {
  console.log('═'.repeat(60));
  console.log('🔍 아이돌 ID 스캔 (ID 1-300 범위)');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const validIdols = [];

  try {
    const page = await context.newPage();

    // ID 1-300 범위 스캔 (빠른 체크)
    console.log('\n📡 ID 스캔 중...\n');

    for (let id = 1; id <= 300; id++) {
      const url = `https://dukplace.com/ko/place/events/list/${id}`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 8000
        });

        // 빠른 체크: 이벤트 카드 존재 여부
        const result = await page.evaluate(() => {
          const cards = document.querySelectorAll('[id^="event-"]');
          if (cards.length === 0) return null;

          // 아이돌 이름 추출 시도
          const titleEl = document.querySelector('h1, [class*="font-bold"]');
          const name = titleEl?.textContent?.trim().split('\n')[0] || 'Unknown';

          return { eventCount: cards.length, name };
        });

        if (result && result.eventCount > 0) {
          validIdols.push({
            id,
            name: result.name,
            eventCount: result.eventCount
          });
          console.log(`✅ ID ${id}: ${result.name} - ${result.eventCount}개 이벤트`);
        } else {
          process.stdout.write(`\r⏳ 스캔 중: ${id}/300...`);
        }
      } catch (err) {
        process.stdout.write(`\r⏳ 스캔 중: ${id}/300...`);
      }
    }

    console.log('\n\n' + '═'.repeat(60));
    console.log(`📊 스캔 완료: ${validIdols.length}명의 아이돌 발견`);
    console.log('═'.repeat(60));

    // 이벤트 수 기준 정렬
    validIdols.sort((a, b) => b.eventCount - a.eventCount);

    validIdols.forEach((idol, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ID ${idol.id.toString().padStart(3)}: ${idol.eventCount}개 이벤트`);
    });

    // 결과 저장
    fs.writeFileSync(
      './src/data/scanned_idols.json',
      JSON.stringify(validIdols, null, 2),
      'utf-8'
    );
    console.log('\n💾 저장됨: src/data/scanned_idols.json');

    return validIdols;

  } finally {
    await browser.close();
  }
}

scanIdolIds().catch(console.error);
