require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * 여러 아이돌의 이벤트를 크롤링하는 스크립트
 * 기존 crawl-events-v3.js 기반
 */

// 크롤링할 아이돌 목록 (ID, 이름)
// HOT 20 기준 + 추가 아이돌
const IDOL_LIST = [
  // 이미 크롤링한 아이돌은 스킵 가능
  // { id: 65, name: '운학', group: '보이넥스트도어' },

  // 보이넥스트도어
  { id: 64, name: '성호', group: '보이넥스트도어' },
  { id: 66, name: '명재현', group: '보이넥스트도어' },
  { id: 67, name: '이한', group: '보이넥스트도어' },
  { id: 68, name: '태산', group: '보이넥스트도어' },
  { id: 69, name: '리우', group: '보이넥스트도어' },

  // 투모로우바이투게더
  { id: 1, name: '수빈', group: '투모로우바이투게더' },
  { id: 2, name: '연준', group: '투모로우바이투게더' },
  { id: 3, name: '범규', group: '투모로우바이투게더' },
  { id: 4, name: '태현', group: '투모로우바이투게더' },
  { id: 5, name: '휴닝카이', group: '투모로우바이투게더' },

  // 엔하이픈
  { id: 10, name: '희승', group: '엔하이픈' },
  { id: 11, name: '제이', group: '엔하이픈' },
  { id: 12, name: '제이크', group: '엔하이픈' },
  { id: 13, name: '성훈', group: '엔하이픈' },
  { id: 14, name: '선우', group: '엔하이픈' },
  { id: 15, name: '정원', group: '엔하이픈' },
  { id: 16, name: '니키', group: '엔하이픈' },

  // 세븐틴 (일부)
  { id: 100, name: '에스쿱스', group: '세븐틴' },
  { id: 101, name: '정한', group: '세븐틴' },
  { id: 102, name: '조슈아', group: '세븐틴' },

  // 방탄소년단
  { id: 200, name: '진', group: '방탄소년단' },
  { id: 201, name: '슈가', group: '방탄소년단' },
  { id: 202, name: '제이홉', group: '방탄소년단' },
  { id: 203, name: 'RM', group: '방탄소년단' },
  { id: 204, name: '지민', group: '방탄소년단' },
  { id: 205, name: '뷔', group: '방탄소년단' },
  { id: 206, name: '정국', group: '방탄소년단' },
];

async function crawlMultipleIdols() {
  console.log('═'.repeat(60));
  console.log('🚀 다중 아이돌 이벤트 크롤러');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'ko-KR',
  });

  const allResults = [];
  const validIdols = [];

  try {
    const page = await context.newPage();

    // 1단계: 유효한 아이돌 ID 찾기
    console.log('\n📡 Step 1: 유효한 아이돌 ID 확인 중...\n');

    for (const idol of IDOL_LIST) {
      const url = `https://dukplace.com/ko/place/events/list/${idol.id}`;
      process.stdout.write(`  [${idol.id}] ${idol.name}...`);

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        // 페이지가 존재하고 이벤트가 있는지 확인
        await page.waitForTimeout(1000);

        const hasEvents = await page.evaluate(() => {
          const cards = document.querySelectorAll('[id^="event-"]');
          return cards.length > 0;
        });

        if (hasEvents) {
          // 이벤트 개수 확인
          const eventCount = await page.evaluate(() => {
            return document.querySelectorAll('[id^="event-"]').length;
          });

          validIdols.push({ ...idol, eventCount });
          console.log(` ✅ ${eventCount}개 이벤트`);
        } else {
          console.log(' ❌ 이벤트 없음');
        }
      } catch (err) {
        console.log(' ⚠️ 접속 실패');
      }
    }

    console.log(`\n✅ 유효한 아이돌: ${validIdols.length}명`);
    validIdols.forEach(idol => {
      console.log(`   - ${idol.name} (${idol.group}): ${idol.eventCount}개`);
    });

    // 결과 저장
    fs.writeFileSync(
      './src/data/valid_idols.json',
      JSON.stringify(validIdols, null, 2),
      'utf-8'
    );
    console.log('\n💾 저장됨: src/data/valid_idols.json');

    return validIdols;

  } finally {
    await browser.close();
  }
}

crawlMultipleIdols().catch(console.error);
