import axios from 'axios';

export async function getInstagramProfile(username: string) {
  try {
    console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

    // Fetch the Instagram profile page HTML
    const response = await axios.get(
      `https://www.instagram.com/${username}/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        timeout: 20000,
      }
    );

    const html = response.data;
    console.log(`[Scraper] Got HTML response, parsing...`);

    // Method 1: Extract from og:description meta tag
    // Pattern: "325 Followers, 26 Following, 60 Posts - See Instagram photos and videos"
    const ogDescriptionMatch = html.match(
      /<meta\s+property="og:description"\s+content="([^"]*)/
    );
    
    if (ogDescriptionMatch) {
      const description = ogDescriptionMatch[1];
      console.log(`[Scraper] og:description: ${description.substring(0, 100)}`);
      
      const followersMatch = description.match(/(\d+)\s+Followers?/);
      const followingMatch = description.match(/(\d+)\s+Following/);
      const nameMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)/);
      const picMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)/);

      if (followersMatch) {
        const followers = parseInt(followersMatch[1]);
        const following = followingMatch ? parseInt(followingMatch[1]) : 0;
        const fullName = nameMatch ? nameMatch[1].split(' - ')[0] : username;
        const profilePic = picMatch ? picMatch[1] : '';

        console.log(`[Scraper] ✅ Successfully extracted: ${followers} followers`);

        return {
          username: username,
          followers: followers,
          following: following,
          profilePicUrl: profilePic,
          biography: '',
          fullName: fullName,
        };
      }
    }

    // Method 2: Look in window.__data embedded in HTML
    const sharedDataMatch = html.match(
      /window\.__data\s*=\s*({.*?})\s*;<\/script>/s
    );
    if (sharedDataMatch) {
      try {
        const dataStr = sharedDataMatch[1];
        const followersMatch = dataStr.match(/"edge_followed_by":{"count":(\d+)/);
        if (followersMatch) {
          return {
            username: username,
            followers: parseInt(followersMatch[1]),
            following: 0,
            profilePicUrl: '',
            biography: '',
            fullName: username,
          };
        }
      } catch (e) {
        console.error(`[Scraper] Error parsing embedded data:`, e);
      }
    }

    console.log(`[Scraper] No follower data found in HTML`);
    return null;
  } catch (error: any) {
    console.error(
      `[Scraper] Error fetching Instagram profile for @${username}:`,
      error.response?.status,
      error.message
    );
    return null;
  }
}

export async function getInstagramFollowers(username: string): Promise<number | null> {
  try {
    const profile = await getInstagramProfile(username);
    if (profile) {
      console.log(`[Scraper] ✅ Got ${profile.followers} followers for @${username}`);
      return profile.followers;
    }
    console.log(`[Scraper] No profile data returned`);
    return null;
  } catch (error) {
    console.error(`[Scraper] Error fetching followers:`, error);
    return null;
  }
}
