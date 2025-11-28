require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * 상위 아이돌들의 이벤트 크롤링
 */

// 스캔으로 발견한 상위 아이돌 목록
const TOP_IDOLS = [
  // { id: 65, name: '운학', group: '보이넥스트도어' }, // 이미 크롤링됨
  { id: 62, name: '명재현', group: '보이넥스트도어' },
  { id: 27, name: '수빈', group: '투모로우바이투게더' },
  { id: 355, name: '도영', group: '트레저' },
  { id: 34, name: '성훈', group: '엔하이픈' },
  { id: 24, name: '진', group: '방탄소년단' },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);

      setTimeout(() => {
        clearInterval(timer);
        resolve();
      }, 15000);
    });
  });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function crawlIdol(page, idol, imagesDir) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`🎯 ${idol.name} (${idol.group}) - ID: ${idol.id}`);
  console.log(`${'─'.repeat(50)}`);

  const listUrl = `https://dukplace.com/ko/place/events/list/${idol.id}`;
  await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60000 });

  // 이벤트 카드 로드 대기
  await page.waitForSelector('[id^="event-"]', { timeout: 10000 }).catch(() => {
    console.log('⚠️ 이벤트 카드 로드 타임아웃');
  });

  // 스크롤하여 모든 이벤트 로드
  await autoScroll(page);

  // 이벤트 정보 추출
  const events = await page.evaluate(() => {
    const cards = document.querySelectorAll('[id^="event-"]');
    const results = [];

    cards.forEach(card => {
      const id = card.id?.replace('event-', '');
      if (!id || results.some(e => e.id === id)) return;

      // 이미지 URL 추출
      const img = card.querySelector('img');
      let imageUrl = img?.src || '';
      if (imageUrl.includes('/_next/image')) {
        const urlMatch = imageUrl.match(/url=([^&]+)/);
        if (urlMatch) imageUrl = decodeURIComponent(urlMatch[1]);
      }

      // 제목
      const title = card.querySelector('h3')?.textContent?.trim() || '';

      // 장소
      const locationEl = Array.from(card.querySelectorAll('p')).find(p =>
        p.textContent?.includes('📍')
      );
      const location = locationEl?.querySelector('span.font-black')?.textContent?.trim() || '';

      // 날짜
      const dateEl = Array.from(card.querySelectorAll('p')).find(p => {
        const text = p.textContent || '';
        return text.includes('월') && text.includes('일') && !text.includes('📍');
      });
      const date = dateEl?.textContent?.trim() || '';

      // 지역 배지
      const regionBadge = card.querySelector('[class*="bg-red-400"], [class*="bg-blue-400"], [class*="bg-blue-600"], [class*="bg-green-400"]');
      const region = regionBadge?.textContent?.trim() || '';

      // 이벤트 타입
      const eventTypes = [];
      card.querySelectorAll('[class*="bg-purple-100"], [class*="bg-yellow-100"], [class*="bg-blue-100"], [class*="bg-pink-100"], [class*="bg-green-100"]').forEach(el => {
        const type = el.textContent?.trim();
        if (type && !eventTypes.includes(type)) eventTypes.push(type);
      });

      // 굿즈
      const goods = [];
      card.querySelectorAll('[class*="border-gray-200"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text && !text.match(/^\+\d+$/) && text.length < 20 && !goods.includes(text)) {
          goods.push(text);
        }
      });

      if (title) {
        results.push({
          id,
          title,
          location,
          region,
          date,
          imageUrl,
          eventTypes,
          goods,
          detailUrl: `https://dukplace.com/ko/place/events/detail/${id}`
        });
      }
    });

    return results;
  });

  console.log(`   ✅ ${events.length}개 이벤트 발견`);

  // 이미지 다운로드
  let downloadedCount = 0;
  for (const event of events) {
    if (!event.imageUrl) continue;

    const fileName = `${idol.id}-event-${event.id}.webp`;
    const localPath = path.join(imagesDir, fileName);

    try {
      // 이미 있으면 스킵
      if (fs.existsSync(localPath)) {
        event.localImageUrl = `/images/events/${fileName}`;
        downloadedCount++;
        continue;
      }

      const imageBuffer = await downloadImage(event.imageUrl);
      fs.writeFileSync(localPath, imageBuffer);
      event.localImageUrl = `/images/events/${fileName}`;
      downloadedCount++;
    } catch (err) {
      event.localImageUrl = event.imageUrl;
    }
  }

  console.log(`   📷 ${downloadedCount}/${events.length} 이미지 저장됨`);

  return {
    idol: { id: idol.id, name: idol.name, group: idol.group },
    crawledAt: new Date().toISOString(),
    totalEvents: events.length,
    events
  };
}

async function crawlTopIdols() {
  console.log('═'.repeat(60));
  console.log('🚀 상위 아이돌 이벤트 크롤링');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const imagesDir = path.join(__dirname, '../public/images/events');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const allResults = [];

  try {
    const page = await context.newPage();

    for (const idol of TOP_IDOLS) {
      try {
        const result = await crawlIdol(page, idol, imagesDir);
        allResults.push(result);

        // 개별 저장
        const outputPath = path.join(__dirname, `../src/data/events_${idol.id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`   💾 저장됨: events_${idol.id}.json`);

      } catch (err) {
        console.log(`   ❌ 에러: ${err.message}`);
      }
    }

    // 기존 운학 데이터 로드
    const existingPath = path.join(__dirname, '../src/data/crawled_events.json');
    if (fs.existsSync(existingPath)) {
      const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
      allResults.unshift(existing);
    }

    // 전체 통합 저장
    const combinedPath = path.join(__dirname, '../src/data/all_events.json');
    fs.writeFileSync(combinedPath, JSON.stringify({
      crawledAt: new Date().toISOString(),
      idols: allResults.map(r => ({
        id: r.idol.id,
        name: r.idol.name,
        group: r.idol.group,
        eventCount: r.totalEvents
      })),
      totalIdols: allResults.length,
      totalEvents: allResults.reduce((sum, r) => sum + r.totalEvents, 0)
    }, null, 2), 'utf-8');

    // 요약
    console.log('\n' + '═'.repeat(60));
    console.log('📊 크롤링 완료 요약');
    console.log('═'.repeat(60));
    console.log(`총 아이돌: ${allResults.length}명`);
    console.log(`총 이벤트: ${allResults.reduce((sum, r) => sum + r.totalEvents, 0)}개`);
    allResults.forEach(r => {
      console.log(`  - ${r.idol.name} (${r.idol.group}): ${r.totalEvents}개`);
    });

    return allResults;

  } finally {
    await browser.close();
  }
}

crawlTopIdols().catch(console.error);
