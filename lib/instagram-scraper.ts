import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface InstagramProfile {
  username: string;
  followers: number;
  following: number;
  posts: number;
  profilePicUrl: string;
  biography: string;
  fullName: string;
  isDemo: boolean;
}

// Primary API: instagram120 (tested and working!)
async function fetchFromInstagram120(username: string): Promise<InstagramProfile | null> {
  if (!RAPIDAPI_KEY) return null;
  
  try {
    console.log(`[Scraper] Trying instagram120 API...`);
    
    const response = await axios.post(
      'https://instagram120.p.rapidapi.com/api/instagram/profile',
      { username },
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram120.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const result = response.data?.result;
    
    if (result && result.edge_followed_by?.count !== undefined) {
      console.log(`[Scraper] ✅ instagram120 returned: ${result.edge_followed_by.count} followers`);
      
      return {
        username: result.username || username,
        followers: result.edge_followed_by.count,
        following: result.edge_follow?.count || 0,
        posts: result.edge_owner_to_timeline_media?.count || 0,
        profilePicUrl: result.profile_pic_url_hd || result.profile_pic_url || '',
        biography: result.biography || '',
        fullName: result.full_name || username,
        isDemo: false,
      };
    }
    
    console.log(`[Scraper] instagram120 returned unexpected format`);
    return null;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message;
    console.log(`[Scraper] instagram120 failed: ${msg}`);
    return null;
  }
}

// Fallback APIs (GET-based)
const fallbackAPIs = [
  {
    name: 'instagram-scraper-api',
    host: 'instagram-scraper-api.p.rapidapi.com',
    endpoint: (username: string) => `https://instagram-scraper-api.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
    parseResponse: (data: any) => ({
      followers: data?.data?.follower_count || data?.data?.edge_followed_by?.count,
      following: data?.data?.following_count || data?.data?.edge_follow?.count,
      posts: data?.data?.media_count || 0,
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
      posts: data?.user?.media_count || 0,
      fullName: data?.user?.full_name || data?.full_name,
      biography: data?.user?.biography || data?.biography,
      profilePicUrl: data?.user?.profile_pic_url || data?.profile_pic_url,
    }),
  },
];

// Demo data fallback
const demoProfiles: Record<string, InstagramProfile> = {
  'therajeshchityal': {
    username: 'therajeshchityal',
    followers: 351,
    following: 26,
    posts: 60,
    profilePicUrl: 'https://scontent.cdninstagram.com/v/t51.82787-19/626935884_17899596549376440_6100310365906891796_n.jpg',
    biography: 'AI Tools & Business Growth • Helping entrepreneurs grow with AI 🤖',
    fullName: 'Rajesh Chityal | AI Tools & Business Growth',
    isDemo: true,
  },
};

export async function getInstagramProfile(username: string): Promise<InstagramProfile | null> {
  console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

  // Try RapidAPI if key is available
  if (RAPIDAPI_KEY && RAPIDAPI_KEY.length > 10) {
    // Try primary API first (instagram120)
    const result = await fetchFromInstagram120(username);
    if (result) return result;
    
    // Try fallback APIs
    for (const api of fallbackAPIs) {
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
            posts: parsed.posts || 0,
            profilePicUrl: parsed.profilePicUrl || '',
            biography: parsed.biography || '',
            fullName: parsed.fullName || username,
            isDemo: false,
          };
        }
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log(`[Scraper] ${api.name} failed: ${msg}`);
        continue;
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
