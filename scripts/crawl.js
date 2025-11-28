const fs = require('fs');
const path = require('path');

async function crawl() {
  console.log('🚀 Starting SMART crawler (Fixed)...');
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://dukplace.com/',
    'Origin': 'https://dukplace.com',
    'Accept': 'application/json'
  };

  let allCourses = [];
  
  try {
    // 1. Fetch Common/Trending Spots
    console.log('📡 Fetching Trending spots...');
    const res = await fetch('https://dukplace.com/api/common-spots?page=1&size=100&lang=ko&status=APPROVED', { headers });
    const data = await res.json();
    const spots = data.spots || data.content || [];
    console.log(`   Found ${spots.length} raw spots.`);

    if (spots.length > 0) {
      // 1. Master Trending Course
      allCourses.push({
        id: 'trending-master',
        title: "🔥 SEOUL TOP 10 TRENDING",
        curator: "Duckmate AI",
        description: "The absolute hottest places visited by K-pop fans this week.",
        likes: 5200,
        tags: ["Trending", "Hot"],
        image: spots[0]?.imageFiles?.[0]?.imageUrl || null,
        spots: spots.slice(0, 10).map(mapSpot)
      });

      // 2. Cafe Tour (Filter by Category or Name)
      const cafes = spots.filter(s => {
          const name = s.placeName || s.name || '';
          const cat = s.category || '';
          return cat === 'CAFE' || name.includes('카페') || name.includes('Cafe');
      });
      
      if (cafes.length > 0) {
        allCourses.push({
          id: 'theme-cafe',
          title: "☕ AESTHETIC CAFE HOPPING",
          curator: "Coffee Luv",
          description: "Instagrammable cafes where idols have visited.",
          likes: 3400,
          tags: ["Cafe", "Photo"],
          image: cafes[0]?.imageFiles?.[0]?.imageUrl || null,
          spots: cafes.map(mapSpot)
        });
      }

      // 3. Photo/Culture Tour (The rest)
      const others = spots.filter(s => !cafes.includes(s));
      if (others.length > 0) {
        allCourses.push({
          id: 'theme-culture',
          title: "📸 K-CULTURE & PHOTO SPOTS",
          curator: "Seoul Explorer",
          description: "Pop-up stores, photo booths, and cultural landmarks.",
          likes: 2800,
          tags: ["Culture", "Activity"],
          image: others[0]?.imageFiles?.[0]?.imageUrl || null,
          spots: others.map(mapSpot)
        });
      }
    }

    // Save to file
    const outputPath = path.join(__dirname, '../src/data/crawled_courses.json');
    fs.writeFileSync(outputPath, JSON.stringify(allCourses, null, 2));
    console.log(`\n🎉 Total Courses Generated: ${allCourses.length}`);

  } catch (error) {
    console.error('❌ Crawl failed:', error);
  }
}

function mapSpot(item) {
  return {
    name: item.placeName || item.name,
    type: item.category || 'Spot',
    location: item.address || item.roadAddress || 'Seoul',
    image: (item.imageFiles && item.imageFiles[0]) ? item.imageFiles[0].imageUrl : null
  };
}

crawl();
