require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Firebase imports
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

/**
 * DukPlace 이벤트 크롤러 v3 (Playwright + Firebase)
 *
 * 사용법:
 *   node scripts/crawl-events-v3.js [idolId] [idolName]
 *   node scripts/crawl-events-v3.js 65 "운학"
 *
 * 환경변수 (.env.local):
 *   NEXT_PUBLIC_FIREBASE_* - Firebase 설정
 *   USE_FIREBASE - "true"로 설정시 Firebase 사용
 */

const DEFAULT_IDOL_ID = 65;
const DEFAULT_IDOL_NAME = '운학';

// Firebase 설정
let db = null;
let storage = null;
let useFirebase = process.env.USE_FIREBASE === 'true';

async function initFirebase() {
  if (!useFirebase) return false;

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.log('⚠️ Firebase 환경변수가 설정되지 않았습니다. 로컬 모드로 전환.');
      useFirebase = false;
      return false;
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('✅ Firebase 연결 성공');
    console.log(`   Project: ${firebaseConfig.projectId}`);
    return true;
  } catch (error) {
    console.log('⚠️ Firebase 초기화 실패:', error.message);
    useFirebase = false;
    return false;
  }
}

async function crawlEvents(idolId = DEFAULT_IDOL_ID, idolName = DEFAULT_IDOL_NAME) {
  console.log('═'.repeat(60));
  console.log('🚀 DukPlace Event Crawler v3 (Playwright + Firebase)');
  console.log(`🎯 Target: ${idolName} (ID: ${idolId})`);
  console.log('═'.repeat(60));

  // Firebase 초기화 시도
  await initFirebase();
  console.log(`💾 Storage Mode: ${useFirebase ? '☁️ Firebase' : '💻 Local'}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ko-KR',
  });

  try {
    const page = await context.newPage();

    // Step 1: 이벤트 목록 페이지 크롤링
    console.log('\n📡 Step 1: 이벤트 목록 페이지 로딩...');
    const listUrl = `https://dukplace.com/ko/place/events/list/${idolId}`;
    await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // 이벤트 카드가 로드될 때까지 대기
    await page.waitForSelector('[id^="event-"]', { timeout: 10000 }).catch(() => {
      console.log('⚠️ 이벤트 카드를 찾을 수 없습니다.');
    });

    // 스크롤하여 모든 이벤트 로드
    await autoScroll(page);

    // 이벤트 카드에서 기본 정보 추출
    const events = await page.evaluate(() => {
      const cards = document.querySelectorAll('[id^="event-"]');
      const results = [];

      cards.forEach(card => {
        const id = card.id?.replace('event-', '');
        if (!id || results.some(e => e.id === id)) return;

        // 이미지 URL 추출 및 디코딩
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

        // 이벤트 타입 태그
        const eventTypes = [];
        card.querySelectorAll('[class*="bg-purple-100"], [class*="bg-yellow-100"], [class*="bg-blue-100"], [class*="bg-pink-100"], [class*="bg-green-100"]').forEach(el => {
          const type = el.textContent?.trim();
          if (type && !eventTypes.includes(type)) eventTypes.push(type);
        });

        // 굿즈 리스트
        const goods = [];
        card.querySelectorAll('[class*="border-gray-200"]').forEach(el => {
          const text = el.textContent?.trim();
          if (text && !text.match(/^\+\d+$/) && text.length < 20 && !goods.includes(text)) {
            goods.push(text);
          }
        });

        // 추가 굿즈 개수
        const moreMatch = card.textContent?.match(/\+(\d+)/);
        const moreGoods = moreMatch ? parseInt(moreMatch[1]) : 0;

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
            moreGoods,
            detailUrl: `https://dukplace.com/ko/place/events/detail/${id}`
          });
        }
      });

      return results;
    });

    console.log(`   ✅ ${events.length}개 이벤트 발견`);

    // Step 2: 각 이벤트 상세 페이지에서 추가 정보 수집
    console.log('\n📡 Step 2: 상세 정보 수집 중...');
    const detailedEvents = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      process.stdout.write(`   [${i + 1}/${events.length}] ${event.title.slice(0, 25).padEnd(25)}...`);

      try {
        await page.goto(event.detailUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(300);

        const details = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';

          // 주소 찾기
          const addressMatch = bodyText.match(/(서울|부산|대구|대전|광주|인천)[^\n]{5,50}(동|로|길)\s*\d*/);
          const address = addressMatch ? addressMatch[0].trim() : null;

          // 운영시간 찾기
          const timeMatch = bodyText.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/);
          const operatingHours = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : null;

          // 설명
          const metaDesc = document.querySelector('meta[name="description"]');
          const description = metaDesc?.getAttribute('content') || null;

          return { address, operatingHours, description };
        });

        detailedEvents.push({ ...event, ...details });
        console.log(' ✓');

      } catch (err) {
        console.log(' ⚠️');
        detailedEvents.push(event);
      }
    }

    // Step 3: 이미지 다운로드/업로드
    console.log('\n📡 Step 3: 이미지 처리 중...');
    const imagesDir = path.join(__dirname, '../public/images/events');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    for (let i = 0; i < detailedEvents.length; i++) {
      const event = detailedEvents[i];
      if (!event.imageUrl) continue;

      const fileName = `event-${event.id}.webp`;
      const localPath = path.join(imagesDir, fileName);

      process.stdout.write(`   [${i + 1}/${detailedEvents.length}] `);

      try {
        const imageBuffer = await downloadImage(event.imageUrl);

        if (useFirebase) {
          // Firebase Storage에 업로드
          const storageRef = ref(storage, `events/${fileName}`);
          await uploadBytes(storageRef, imageBuffer, { contentType: 'image/webp' });
          const downloadUrl = await getDownloadURL(storageRef);
          event.firebaseImageUrl = downloadUrl;
          console.log('☁️ Firebase 업로드 완료');
        }

        // 항상 로컬에도 저장 (백업)
        fs.writeFileSync(localPath, imageBuffer);
        event.localImageUrl = `/images/events/${fileName}`;

        if (!useFirebase) {
          console.log('💾 로컬 저장 완료');
        }

      } catch (err) {
        console.log(`⚠️ 실패: ${err.message.slice(0, 30)}`);
        event.localImageUrl = event.imageUrl;
      }
    }

    // Step 4: 데이터 저장
    console.log('\n📡 Step 4: 데이터 저장 중...');
    const result = {
      idol: { id: idolId, name: idolName },
      crawledAt: new Date().toISOString(),
      totalEvents: detailedEvents.length,
      events: detailedEvents,
    };

    if (useFirebase) {
      try {
        // Firestore에 메인 문서 저장
        const docRef = doc(db, 'crawled_events', `idol-${idolId}`);
        await setDoc(docRef, {
          idol: result.idol,
          crawledAt: result.crawledAt,
          totalEvents: result.totalEvents,
        });

        // 각 이벤트를 서브컬렉션에 저장
        const eventsCollection = collection(db, 'crawled_events', `idol-${idolId}`, 'events');
        for (const event of detailedEvents) {
          const eventDoc = doc(eventsCollection, event.id);
          await setDoc(eventDoc, event);
        }

        console.log('   ✅ Firestore 저장 완료');
      } catch (err) {
        console.log(`   ⚠️ Firestore 저장 실패: ${err.message}`);
      }
    }

    // 항상 로컬 JSON도 저장 (백업)
    const outputPath = path.join(__dirname, '../src/data/crawled_events.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`   ✅ 로컬 JSON 저장 완료`);

    // 요약 출력
    printSummary(detailedEvents, useFirebase);

    return result;

  } finally {
    await browser.close();
  }
}

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
      }, 10000);
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

function printSummary(events, isFirebase) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 크롤링 완료 요약');
  console.log('═'.repeat(60));

  console.log(`\n✅ 총 이벤트: ${events.length}개`);
  console.log(`💾 저장 위치: ${isFirebase ? '☁️ Firebase + 로컬' : '💻 로컬 전용'}`);

  // 지역별
  const regions = {};
  events.forEach(e => {
    const r = e.region || 'Unknown';
    regions[r] = (regions[r] || 0) + 1;
  });
  console.log('\n📍 지역별:');
  Object.entries(regions).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`   ${r}: ${c}개`);
  });

  // 이벤트 타입별
  const types = {};
  events.forEach(e => {
    (e.eventTypes || []).forEach(t => {
      types[t] = (types[t] || 0) + 1;
    });
  });
  if (Object.keys(types).length > 0) {
    console.log('\n🏷️ 이벤트 타입:');
    Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
      console.log(`   ${t}: ${c}개`);
    });
  }

  // 이미지 저장 현황
  const firebaseImages = events.filter(e => e.firebaseImageUrl).length;
  const localImages = events.filter(e => e.localImageUrl).length;
  console.log(`\n🖼️ 이미지:`);
  if (isFirebase) {
    console.log(`   Firebase: ${firebaseImages}/${events.length}`);
  }
  console.log(`   로컬: ${localImages}/${events.length}`);

  console.log('\n' + '═'.repeat(60));
}

// CLI 실행
const args = process.argv.slice(2);
const idolId = args[0] ? parseInt(args[0]) : DEFAULT_IDOL_ID;
const idolName = args[1] || DEFAULT_IDOL_NAME;

crawlEvents(idolId, idolName).catch(console.error);
