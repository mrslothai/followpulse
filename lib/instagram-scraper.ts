const puppeteer = require('puppeteer');

export async function getInstagramProfile(username: string) {
  let browser: any = null;
  try {
    console.log(`[Scraper] Fetching FRESH Instagram profile for @${username}...`);
    
    // Launch browser with fresh profile
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disable-popup-blocking',
        '--disable-sync',
      ],
    });

    const page = await browser.newPage();

    // Clear any cache
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });

    // Set realistic headers to avoid caching
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    // Disable caching
    await page.setCacheEnabled(false);

    // Set headers to force fresh content
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    console.log(`[Scraper] Navigating to fresh profile page...`);
    
    // Navigate without cache
    await page.goto(`https://www.instagram.com/${username}/?hl=en`, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // Wait for JavaScript to render
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Force reload to get fresh data
    console.log(`[Scraper] Force reloading for fresh data...`);
    await page.reload({
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`[Scraper] Extracting REAL follower data...`);

    // Extract profile data using MULTIPLE extraction methods
    const profileData = await page.evaluate(() => {
      let followers = 0;
      let following = 0;
      let fullName = '';
      let biography = '';
      let profilePic = '';

      // Method 1: Extract from meta og:description (most reliable)
      const metas = document.querySelectorAll('meta');
      metas.forEach((meta) => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content') || '';

        if (property === 'og:description') {
          console.log('[Scraper-Eval] Found og:description:', content.substring(0, 100));
          
          // Pattern: "241 Followers, 26 Following, 60 Posts - See Instagram photos and videos"
          const followersMatch = content.match(/(\d+)\s+Followers?/);
          const followingMatch = content.match(/(\d+)\s+Following/);
          
          if (followersMatch) {
            followers = parseInt(followersMatch[1]);
            console.log('[Scraper-Eval] Extracted followers:', followers);
          }
          if (followingMatch) {
            following = parseInt(followingMatch[1]);
            console.log('[Scraper-Eval] Extracted following:', following);
          }
        }
        
        if (property === 'og:title') {
          fullName = content.split(' - ')[0] || '';
        }
        
        if (property === 'og:image') {
          profilePic = content;
        }
      });

      // Method 2: Try to find in JSON-LD structured data
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data.interactionStatistic) {
            data.interactionStatistic.forEach((stat: any) => {
              if (stat['@type'] === 'InteractionCounter' && stat.interactionType?.includes('FollowAction')) {
                followers = parseInt(stat.userInteractionCount) || followers;
                console.log('[Scraper-Eval] Found followers in JSON-LD:', followers);
              }
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }

      // Method 3: Look for data in page source scripts
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        const text = script.textContent || '';
        
        if (text.includes('"edge_followed_by"')) {
          const match = text.match(/"edge_followed_by":{"count":(\d+)/);
          if (match) {
            followers = parseInt(match[1]);
            console.log('[Scraper-Eval] Found followers in script:', followers);
          }
        }
        
        if (text.includes('"edge_follow"') && !text.includes('edge_followed_by')) {
          const match = text.match(/"edge_follow":{"count":(\d+)/);
          if (match) {
            following = parseInt(match[1]);
          }
        }
      }

      // Method 4: Try to find in actual DOM text
      if (followers === 0) {
        const allText = document.body.innerText;
        const lines = allText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.includes('Followers') && !line.includes(',')) {
            const match = line.match(/(\d+)/);
            if (match && i > 0) {
              const prevLine = lines[i - 1].trim();
              const prevMatch = prevLine.match(/(\d+)/);
              if (prevMatch) {
                followers = parseInt(prevMatch[1]);
                console.log('[Scraper-Eval] Found followers in DOM:', followers);
                break;
              }
            }
          }
        }
      }

      return {
        followers: followers || 0,
        following: following || 0,
        fullName,
        biography,
        profilePic,
      };
    });

    console.log(`[Scraper] Successfully extracted REAL data:`, profileData);
    await browser.close();

    if (profileData.followers > 0) {
      return {
        username: username,
        followers: profileData.followers,
        following: profileData.following || 0,
        profilePicUrl: profileData.profilePic || '',
        biography: profileData.biography || '',
        fullName: profileData.fullName || username,
      };
    }

    console.log(`[Scraper] No valid follower data found after fresh fetch`);
    return null;
  } catch (error) {
    console.error(`[Scraper] Error fetching Instagram profile for @${username}:`, error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[Scraper] Error closing browser:', closeError);
      }
    }
    return null;
  }
}

export async function getInstagramFollowers(username: string): Promise<number | null> {
  try {
    const profile = await getInstagramProfile(username);
    if (profile) {
      console.log(`[Scraper] ✅ Got ${profile.followers} followers for @${username} (REAL-TIME)`);
      return profile.followers;
    }
    return null;
  } catch (error) {
    console.error(`[Scraper] Error fetching followers for @${username}:`, error);
    return null;
  }
}
