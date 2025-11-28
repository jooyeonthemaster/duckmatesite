const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * DukPlace 이벤트 크롤러 v2
 * JSON-LD + 상세 페이지 크롤링으로 이벤트 정보를 수집합니다.
 *
 * 사용법: node scripts/crawl-events.js [idolId] [idolName]
 * 예시: node scripts/crawl-events.js 65 "운학"
 */

const DEFAULT_IDOL_ID = 65; // 운학 (BOYNEXTDOOR)
const DEFAULT_IDOL_NAME = '운학';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://dukplace.com/',
};

async function crawlEvents(idolId = DEFAULT_IDOL_ID, idolName = DEFAULT_IDOL_NAME) {
  console.log(`🚀 DukPlace Event Crawler v2`);
  console.log(`🎯 Target: ${idolName} (ID: ${idolId})`);
  console.log('─'.repeat(50));

  const listUrl = `https://dukplace.com/ko/place/events/list/${idolId}`;

  try {
    // Step 1: 목록 페이지에서 JSON-LD 추출
    console.log(`\n📡 Step 1: Fetching event list...`);
    const listHtml = await fetchPage(listUrl);
    const basicEvents = extractJsonLdEvents(listHtml);
    console.log(`   Found ${basicEvents.length} events from JSON-LD`);

    if (basicEvents.length === 0) {
      console.log('⚠️ No events found. The page structure may have changed.');
      return null;
    }

    // Step 2: 각 이벤트 상세 페이지에서 추가 정보 수집
    console.log(`\n📡 Step 2: Fetching event details...`);
    const detailedEvents = [];

    for (let i = 0; i < basicEvents.length; i++) {
      const event = basicEvents[i];
      console.log(`   [${i + 1}/${basicEvents.length}] ${event.name.slice(0, 30)}...`);

      try {
        const details = await fetchEventDetails(event.url);
        detailedEvents.push({
          ...event,
          ...details,
        });
        // Rate limiting - 요청 간 딜레이
        await sleep(500);
      } catch (err) {
        console.log(`   ⚠️ Failed to fetch details: ${err.message}`);
        detailedEvents.push(event);
      }
    }

    // Step 3: 결과 저장
    const result = {
      idol: {
        id: idolId,
        name: idolName,
      },
      crawledAt: new Date().toISOString(),
      totalEvents: detailedEvents.length,
      events: detailedEvents,
    };

    const outputPath = path.join(__dirname, '../src/data/crawled_events.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n💾 Saved to: ${outputPath}`);

    // 요약 출력
    printSummary(detailedEvents);

    return result;

  } catch (error) {
    console.error('\n❌ Crawl failed:', error.message);
    throw error;
  }
}

async function fetchPage(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.text();
}

function extractJsonLdEvents(html) {
  const events = [];

  // JSON-LD 스크립트 찾기
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);

      // ItemList 타입에서 이벤트 추출
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        data.itemListElement.forEach((item, index) => {
          const org = item.item;
          if (org && org.url) {
            // URL에서 이벤트 ID 추출
            const idMatch = org.url.match(/\/detail\/(\d+)/);
            events.push({
              id: idMatch ? idMatch[1] : `unknown-${index}`,
              name: org.name || 'Unknown Event',
              url: org.url,
              imageUrl: org.image || null,
              position: item.position,
            });
          }
        });
      }
    } catch (e) {
      // JSON 파싱 실패 무시
    }
  }

  return events;
}

async function fetchEventDetails(detailUrl) {
  const html = await fetchPage(detailUrl);
  const $ = cheerio.load(html);

  const details = {
    location: null,
    address: null,
    region: null,
    date: null,
    eventTypes: [],
    goods: [],
    description: null,
  };

  // JSON-LD에서 상세 정보 추출
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());

      // Event 타입에서 정보 추출
      if (data['@type'] === 'Event') {
        details.location = data.location?.name || null;
        details.address = data.location?.address?.streetAddress || null;
        details.description = data.description || null;

        if (data.startDate) {
          const start = new Date(data.startDate);
          const end = data.endDate ? new Date(data.endDate) : null;
          details.date = formatDateRange(start, end);
        }
      }
    } catch (e) {
      // 무시
    }
  });

  // HTML에서 추가 정보 추출
  const bodyText = $('body').text();

  // 지역 추출 (홍대, 용산, 부산 등)
  const regionMatch = bodyText.match(/(홍대|용산|강남|신촌|이태원|성수|잠실|부산|대구|대전|광주|제주)/);
  if (regionMatch) {
    details.region = regionMatch[1];
  }

  // 이벤트 타입 추출
  const eventTypeKeywords = ['럭키드로우', '스탬프 투어', '포토부스', '가챠', '사전 예약', '응모권'];
  eventTypeKeywords.forEach(keyword => {
    if (bodyText.includes(keyword)) {
      details.eventTypes.push(keyword);
    }
  });

  // 굿즈 추출
  const goodsKeywords = ['포토카드', '엽서', '스티커', '종이컵', '폴라로이드', '티켓', '부적', '쇼핑백', '카드', '포스터', '연력', '트레카', '포토필름', '온더락잔'];
  goodsKeywords.forEach(keyword => {
    if (bodyText.includes(keyword)) {
      details.goods.push(keyword);
    }
  });

  return details;
}

function formatDateRange(start, end) {
  const formatDate = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

  if (!end || start.getTime() === end.getTime()) {
    return formatDate(start);
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printSummary(events) {
  console.log('\n' + '═'.repeat(50));
  console.log('📊 CRAWL SUMMARY');
  console.log('═'.repeat(50));

  console.log(`\n✅ Total Events: ${events.length}`);

  // 지역별 집계
  const regionCounts = {};
  events.forEach(e => {
    const region = e.region || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });

  console.log('\n📍 By Region:');
  Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`   ${region}: ${count}개`);
    });

  // 이벤트 타입별 집계
  const typeCounts = {};
  events.forEach(e => {
    (e.eventTypes || []).forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
  });

  if (Object.keys(typeCounts).length > 0) {
    console.log('\n🏷️ By Event Type:');
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}개`);
      });
  }

  // 굿즈 집계 (상위 5개)
  const goodsCounts = {};
  events.forEach(e => {
    (e.goods || []).forEach(goods => {
      goodsCounts[goods] = (goodsCounts[goods] || 0) + 1;
    });
  });

  if (Object.keys(goodsCounts).length > 0) {
    console.log('\n🎁 Top Goods:');
    Object.entries(goodsCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([goods, count]) => {
        console.log(`   ${goods}: ${count}개`);
      });
  }

  console.log('\n' + '═'.repeat(50));
}

// CLI 실행
const args = process.argv.slice(2);
const idolId = args[0] ? parseInt(args[0]) : DEFAULT_IDOL_ID;
const idolName = args[1] || DEFAULT_IDOL_NAME;

crawlEvents(idolId, idolName);
