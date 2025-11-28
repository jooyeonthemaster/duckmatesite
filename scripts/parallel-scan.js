require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 병렬로 아이돌 ID 스캔 (더 넓은 범위)
 */

async function parallelScan() {
  console.log('═'.repeat(60));
  console.log('⚡ 병렬 아이돌 ID 스캔 (1-1500 범위)');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const foundIdols = [];

  // 5개의 병렬 브라우저 컨텍스트
  const contexts = await Promise.all(
    Array(5).fill(null).map(() =>
      browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale: 'ko-KR',
      })
    )
  );

  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

  try {
    // ID 범위를 5개로 분할
    const ranges = [
      { start: 1, end: 300 },
      { start: 301, end: 600 },
      { start: 601, end: 900 },
      { start: 901, end: 1200 },
      { start: 1201, end: 1500 },
    ];

    console.log('\n📡 5개 병렬 스캔 시작...\n');

    // 각 범위를 병렬로 스캔
    const scanPromises = ranges.map(async (range, idx) => {
      const page = pages[idx];
      const results = [];

      for (let id = range.start; id <= range.end; id++) {
        try {
          const response = await page.goto(
            `https://dukplace.com/ko/place/events/list/${id}`,
            { waitUntil: 'networkidle', timeout: 10000 }
          );

          // 이벤트 수 확인
          const eventCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('[id^="event-"]');
            return cards.length;
          });

          if (eventCount > 0) {
            // 아이돌 이름 추출
            const idolInfo = await page.evaluate(() => {
              // 페이지 제목이나 메타에서 이름 추출
              const title = document.title || '';
              const match = title.match(/(.+?)의?\s*(생일|이벤트|birthday)/i);
              const name = match ? match[1].trim() : 'Unknown';

              // 또는 페이지 내 정보에서 추출
              const h1 = document.querySelector('h1');
              const displayName = h1?.textContent?.trim() || name;

              return { name: displayName };
            });

            results.push({
              id,
              name: idolInfo.name,
              eventCount
            });

            console.log(`  [범위${idx + 1}] ✅ ID ${id}: ${idolInfo.name} - ${eventCount}개 이벤트`);
          }
        } catch (e) {
          // 에러 무시
        }

        // 진행률 (10개마다)
        if (id % 50 === 0) {
          process.stdout.write(`  [범위${idx + 1}] 스캔 중: ${id}/${range.end}\r`);
        }
      }

      console.log(`  [범위${idx + 1}] 완료: ${results.length}개 발견`);
      return results;
    });

    // 모든 스캔 완료 대기
    const allResults = await Promise.all(scanPromises);
    const flatResults = allResults.flat();

    // 결과 정리
    foundIdols.push(...flatResults);

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 스캔 완료: ${foundIdols.length}명 발견`);
    console.log('═'.repeat(60));

    // 이벤트 수 기준 정렬
    foundIdols.sort((a, b) => b.eventCount - a.eventCount);

    // 상위 30개 표시
    foundIdols.slice(0, 30).forEach((idol, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ID ${idol.id}: ${idol.name} - ${idol.eventCount}개`);
    });

    // 저장
    fs.writeFileSync(
      './src/data/all_idols.json',
      JSON.stringify(foundIdols, null, 2),
      'utf-8'
    );
    console.log(`\n💾 저장됨: src/data/all_idols.json (${foundIdols.length}명)`);

    return foundIdols;

  } finally {
    await browser.close();
  }
}

parallelScan().catch(console.error);
