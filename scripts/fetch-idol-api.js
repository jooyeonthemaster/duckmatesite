const { chromium } = require('playwright');

/**
 * DukPlace API를 통해 아이돌 목록 추출
 */

async function fetchIdolList() {
  console.log('🔍 DukPlace API에서 아이돌 목록 추출 중...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const page = await context.newPage();
  const apiResults = {};

  // 네트워크 응답 캡처
  page.on('response', async (response) => {
    const url = response.url();

    // celeb API 캡처
    if (url.includes('api/celeb')) {
      try {
        const data = await response.json();
        apiResults.celeb = data;
        console.log('✅ Celeb API 캡처됨');
      } catch (e) {}
    }

    // poster API (HOT 20 포함 가능)
    if (url.includes('api/poster')) {
      try {
        const data = await response.json();
        apiResults.poster = data;
        console.log('✅ Poster API 캡처됨');
      } catch (e) {}
    }
  });

  try {
    // 메인 페이지 로드해서 API 호출 트리거
    await page.goto('https://dukplace.com/ko', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 캡처된 API 데이터 분석
    console.log('\n📊 캡처된 API 데이터 분석:\n');

    if (apiResults.celeb) {
      console.log('=== CELEB API ===');
      console.log('타입:', typeof apiResults.celeb);

      if (Array.isArray(apiResults.celeb)) {
        console.log('아이돌 수:', apiResults.celeb.length);
        apiResults.celeb.slice(0, 5).forEach((item, i) => {
          console.log(`${i + 1}. ${JSON.stringify(item).slice(0, 150)}...`);
        });
      } else if (apiResults.celeb.data) {
        console.log('데이터 키:', Object.keys(apiResults.celeb));
        if (Array.isArray(apiResults.celeb.data)) {
          console.log('아이돌 수:', apiResults.celeb.data.length);
          apiResults.celeb.data.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ${JSON.stringify(item).slice(0, 150)}...`);
          });
        }
      } else {
        console.log('구조:', JSON.stringify(apiResults.celeb).slice(0, 500));
      }
    }

    if (apiResults.poster) {
      console.log('\n=== POSTER API ===');
      console.log('키:', Object.keys(apiResults.poster));
    }

    // 추가 API 직접 호출 시도
    console.log('\n🔗 추가 API 호출 시도...\n');

    // HOT celebs API
    const hotResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('https://dukplace.com/api/celeb?type=hot&lang=ko');
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });

    if (hotResponse && !hotResponse.error) {
      console.log('=== HOT CELEB API ===');
      if (Array.isArray(hotResponse)) {
        console.log('HOT 아이돌 수:', hotResponse.length);
        hotResponse.slice(0, 20).forEach((idol, i) => {
          console.log(`${i + 1}. ID: ${idol.id}, 이름: ${idol.name}, 그룹: ${idol.group?.name || idol.groupName || '-'}, 이벤트: ${idol.eventCount || idol.events || '-'}`);
        });

        // 결과 저장
        const fs = require('fs');
        const idolList = hotResponse.map(idol => ({
          id: idol.id,
          name: idol.name,
          group: idol.group?.name || idol.groupName || '',
          birthday: idol.birthday,
          eventCount: idol.eventCount || idol.events || 0
        }));

        fs.writeFileSync('./src/data/idol_list.json', JSON.stringify(idolList, null, 2), 'utf-8');
        console.log('\n💾 저장됨: src/data/idol_list.json');
      } else {
        console.log('응답 구조:', JSON.stringify(hotResponse).slice(0, 500));
      }
    }

    // Birthday celebs API
    const birthdayResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('https://dukplace.com/api/celeb?type=birthday&lang=ko');
        return await res.json();
      } catch (e) {
        return { error: e.message };
      }
    });

    if (birthdayResponse && !birthdayResponse.error) {
      console.log('\n=== BIRTHDAY CELEB API ===');
      if (Array.isArray(birthdayResponse)) {
        console.log('생일 아이돌 수:', birthdayResponse.length);
        birthdayResponse.slice(0, 10).forEach((idol, i) => {
          console.log(`${i + 1}. ID: ${idol.id}, 이름: ${idol.name}`);
        });
      }
    }

    return apiResults;

  } finally {
    await browser.close();
  }
}

fetchIdolList().catch(console.error);
