import axios from 'axios';

// RapidAPI Instagram Scraper integration
// Get your API key from: https://rapidapi.com/rocketapi/api/instagram-scraper-api2

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instagram-scraper-api2.p.rapidapi.com';

// Fallback demo data
const demoProfiles: Record<string, any> = {
  'therajeshchityal': {
    username: 'therajeshchityal',
    followers: 325,
    following: 26,
    profilePicUrl: 'https://scontent.cdninstagram.com/v/t51.82787-19/626935884_17899596549376440_6100310365906891796_n.jpg',
    biography: 'AI Tools & Business Growth • Helping entrepreneurs grow with AI 🤖',
    fullName: 'Rajesh Chityal | AI Tools & Business Growth',
    isDemo: true,
  },
};

export async function getInstagramProfile(username: string) {
  try {
    console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

    // If RapidAPI key is configured, use real API
    if (RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
      console.log(`[Scraper] Using RapidAPI...`);
      
      const response = await axios.get(
        `https://${RAPIDAPI_HOST}/v1/info`,
        {
          params: {
            username_or_id_or_url: username,
          },
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
          },
          timeout: 15000,
        }
      );

      const data = response.data?.data;
      
      if (data) {
        console.log(`[Scraper] ✅ RapidAPI returned real data: ${data.follower_count} followers`);
        
        return {
          username: data.username,
          followers: data.follower_count || 0,
          following: data.following_count || 0,
          profilePicUrl: data.profile_pic_url_hd || data.profile_pic_url || '',
          biography: data.biography || '',
          fullName: data.full_name || data.username,
          isDemo: false,
        };
      }
    } else {
      console.log(`[Scraper] RapidAPI key not configured, using demo data`);
    }

    // Fallback to demo data
    if (demoProfiles[username]) {
      console.log(`[Scraper] Returning demo data for @${username}`);
      return demoProfiles[username];
    }

    console.log(`[Scraper] No data found for @${username}`);
    return null;
  } catch (error: any) {
    console.error(`[Scraper] Error:`, error.response?.data || error.message);
    
    // Return demo data on error
    if (demoProfiles[username]) {
      console.log(`[Scraper] Falling back to demo data`);
      return demoProfiles[username];
    }
    
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
    return null;
  } catch (error) {
    console.error(`[Scraper] Error fetching followers:`, error);
    return null;
  }
}
