const { chromium } = require('playwright');

/**
 * HOT 20 아이돌 ID 추출 스크립트
 * dukplace.com 메인 페이지에서 인기 아이돌 목록과 ID를 추출합니다.
 */

async function findIdolIds() {
  console.log('🔍 HOT 20 아이돌 ID 추출 중...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  try {
    const page = await context.newPage();

    // 메인 페이지 로드
    await page.goto('https://dukplace.com/ko', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 페이지 완전히 로드 대기
    await page.waitForTimeout(3000);

    // 네트워크 요청 모니터링으로 API 호출 찾기
    const idolData = [];

    // HOT 20 아이돌 카드 클릭해서 URL에서 ID 추출
    const cards = await page.$$('[class*="cursor-pointer"]');
    console.log(`발견된 카드: ${cards.length}개\n`);

    // 각 카드의 정보 추출 (클릭 시 이동하는 URL 확인)
    for (let i = 0; i < Math.min(cards.length, 25); i++) {
      const card = cards[i];

      try {
        // 카드 내 텍스트 정보 추출
        const info = await card.evaluate(el => {
          const name = el.querySelector('.font-bold')?.textContent?.trim().split('\n')[0] || '';
          const group = el.querySelector('[class*="bg-main-pink"]')?.textContent?.trim() || '';
          const eventText = el.textContent || '';
          const eventMatch = eventText.match(/(\d+)\s*🎉/);
          const eventCount = eventMatch ? parseInt(eventMatch[1]) : 0;

          return { name, group, eventCount };
        });

        if (info.name && info.eventCount > 0) {
          // 새 탭에서 카드 클릭하여 URL 확인
          const [newPage] = await Promise.all([
            context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
            card.click().catch(() => null)
          ]);

          if (newPage) {
            await newPage.waitForLoadState('domcontentloaded').catch(() => {});
            const url = newPage.url();

            // URL에서 idol ID 추출: /place/events/list/123
            const idMatch = url.match(/\/list\/(\d+)/);
            if (idMatch) {
              info.id = parseInt(idMatch[1]);
              idolData.push(info);
              console.log(`✅ ${info.name} (${info.group}) - ID: ${info.id}, Events: ${info.eventCount}`);
            }

            await newPage.close();
          }
        }
      } catch (err) {
        // 개별 카드 에러 무시
      }
    }

    // 결과가 없으면 다른 방법 시도
    if (idolData.length === 0) {
      console.log('\n⚠️ 카드 클릭 방식 실패, HTML 분석 시도...\n');

      // 페이지 HTML에서 직접 추출
      const html = await page.content();

      // Next.js의 __NEXT_DATA__ 스크립트에서 데이터 추출 시도
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          console.log('Next.js 데이터 발견!');
          // 데이터 구조 탐색
          const props = nextData.props?.pageProps;
          if (props) {
            console.log('PageProps 키:', Object.keys(props));
          }
        } catch (e) {
          console.log('Next.js 데이터 파싱 실패');
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 추출 완료');
    console.log('='.repeat(50));
    console.log(`\n총 ${idolData.length}명의 아이돌 ID 추출됨\n`);

    // 결과를 JSON으로 저장
    if (idolData.length > 0) {
      const fs = require('fs');
      const outputPath = './src/data/idol_list.json';
      fs.writeFileSync(outputPath, JSON.stringify(idolData, null, 2), 'utf-8');
      console.log(`💾 저장됨: ${outputPath}`);
    }

    return idolData;

  } finally {
    await browser.close();
  }
}

findIdolIds().catch(console.error);
