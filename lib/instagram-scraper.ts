import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Multiple API configurations to try
const APIs = [
  {
    name: 'instagram-scraper-api',
    host: 'instagram-scraper-api.p.rapidapi.com',
    endpoint: (username: string) => `https://instagram-scraper-api.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
    parseResponse: (data: any) => ({
      followers: data?.data?.follower_count || data?.data?.edge_followed_by?.count,
      following: data?.data?.following_count || data?.data?.edge_follow?.count,
      fullName: data?.data?.full_name,
      biography: data?.data?.biography,
      profilePicUrl: data?.data?.profile_pic_url_hd || data?.data?.profile_pic_url,
    }),
  },
  {
    name: 'instagram28',
    host: 'instagram28.p.rapidapi.com',
    endpoint: (username: string) => `https://instagram28.p.rapidapi.com/user_info?user_name=${username}`,
    parseResponse: (data: any) => ({
      followers: data?.user?.follower_count || data?.follower_count,
      following: data?.user?.following_count || data?.following_count,
      fullName: data?.user?.full_name || data?.full_name,
      biography: data?.user?.biography || data?.biography,
      profilePicUrl: data?.user?.profile_pic_url || data?.profile_pic_url,
    }),
  },
  {
    name: 'instagram-bulk-profile-scrapper',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    endpoint: (username: string) => `https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile?ig=${username}`,
    parseResponse: (data: any) => ({
      followers: data?.[0]?.follower_count,
      following: data?.[0]?.following_count,
      fullName: data?.[0]?.full_name,
      biography: data?.[0]?.biography,
      profilePicUrl: data?.[0]?.profile_pic_url,
    }),
  },
];

// Demo data fallback
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
  console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

  // Try RapidAPI if key is available
  if (RAPIDAPI_KEY && RAPIDAPI_KEY.length > 10) {
    for (const api of APIs) {
      try {
        console.log(`[Scraper] Trying ${api.name}...`);
        
        const response = await axios.get(api.endpoint(username), {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': api.host,
          },
          timeout: 10000,
        });

        const parsed = api.parseResponse(response.data);
        
        if (parsed.followers && parsed.followers > 0) {
          console.log(`[Scraper] ✅ ${api.name} returned: ${parsed.followers} followers`);
          
          return {
            username: username,
            followers: parsed.followers,
            following: parsed.following || 0,
            profilePicUrl: parsed.profilePicUrl || '',
            biography: parsed.biography || '',
            fullName: parsed.fullName || username,
            isDemo: false,
          };
        }
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log(`[Scraper] ${api.name} failed: ${msg}`);
        continue; // Try next API
      }
    }
    
    console.log(`[Scraper] All RapidAPI attempts failed`);
  } else {
    console.log(`[Scraper] No RapidAPI key configured`);
  }

  // Fallback to demo data
  if (demoProfiles[username]) {
    console.log(`[Scraper] Returning demo data for @${username}`);
    return demoProfiles[username];
  }

  return null;
}

export async function getInstagramFollowers(username: string): Promise<number | null> {
  const profile = await getInstagramProfile(username);
  if (profile) {
    console.log(`[Scraper] Got ${profile.followers} followers for @${username}`);
    return profile.followers;
  }
  return null;
}
