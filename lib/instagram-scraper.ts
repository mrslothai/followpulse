import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const APIFY_KEY = process.env.APIFY_KEY;

interface InstagramProfile {
  username: string;
  followers: number;
  following: number;
  posts: number;
  profilePicUrl: string;
  biography: string;
  fullName: string;
  isDemo: boolean;
  source: string; // 'apify', 'instagram120', or 'demo'
}

// Primary API: Apify Instagram Scraper (real-time, fresh data)
async function fetchFromApify(username: string): Promise<InstagramProfile | null> {
  if (!APIFY_KEY) {
    console.log(`[Scraper] No Apify key configured`);
    return null;
  }

  try {
    console.log(`[Scraper] Fetching from Apify for @${username}...`);

    // Start the actor run
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${APIFY_KEY}`,
      { usernames: [username] },
      { timeout: 30000 }
    );

    const runId = runResponse.data?.data?.id;
    const datasetId = runResponse.data?.data?.defaultDatasetId;

    if (!runId || !datasetId) {
      console.log(`[Scraper] Apify run failed to start`);
      return null;
    }

    console.log(`[Scraper] Apify run started: ${runId}`);

    // Wait for the run to complete (up to 60 seconds)
    let isComplete = false;
    let attempts = 0;
    const maxAttempts = 12; // 12 * 5 seconds = 60 seconds max

    while (!isComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      try {
        const statusResponse = await axios.get(
          `https://api.apify.com/v2/runs/${runId}?token=${APIFY_KEY}`,
          { timeout: 10000 }
        );

        const status = statusResponse.data?.data?.status;
        console.log(`[Scraper] Apify status: ${status} (attempt ${attempts}/${maxAttempts})`);

        if (status === 'SUCCEEDED' || status === 'RUNNING') {
          isComplete = true;
        } else if (status === 'FAILED' || status === 'ABORTED') {
          console.log(`[Scraper] Apify run failed with status: ${status}`);
          return null;
        }
      } catch (error: any) {
        console.log(`[Scraper] Error checking Apify status: ${error.message}`);
      }
    }

    if (!isComplete) {
      console.log(`[Scraper] Apify run timeout after ${maxAttempts * 5} seconds`);
      return null;
    }

    // Fetch the results
    const resultsResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_KEY}`,
      { timeout: 10000 }
    );

    const items = resultsResponse.data;
    if (!items || items.length === 0) {
      console.log(`[Scraper] Apify returned no results`);
      return null;
    }

    const result = items[0];

    if (result.followersCount !== null && result.followersCount !== undefined) {
      console.log(`[Scraper] ✅ Apify returned: ${result.followersCount} followers (FRESH DATA!)`);

      return {
        username: result.username || username,
        followers: result.followersCount,
        following: result.followsCount || 0,
        posts: result.postsCount || 0,
        profilePicUrl: result.profilePicUrlHD || result.profilePicUrl || '',
        biography: result.biography || '',
        fullName: result.fullName || username,
        isDemo: false,
        source: 'apify',
      };
    }

    console.log(`[Scraper] Apify returned unexpected format`);
    return null;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message;
    console.log(`[Scraper] Apify failed: ${msg}`);
    return null;
  }
}

// Fallback API: instagram120 (instant but potentially stale)
async function fetchFromInstagram120(username: string): Promise<InstagramProfile | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    console.log(`[Scraper] Trying instagram120 API (fallback)...`);

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
      console.log(`[Scraper] ✅ instagram120 returned: ${result.edge_followed_by.count} followers (cached)`);

      return {
        username: result.username || username,
        followers: result.edge_followed_by.count,
        following: result.edge_follow?.count || 0,
        posts: result.edge_owner_to_timeline_media?.count || 0,
        profilePicUrl: result.profile_pic_url_hd || result.profile_pic_url || '',
        biography: result.biography || '',
        fullName: result.full_name || username,
        isDemo: false,
        source: 'instagram120',
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

// Demo data fallback
const demoProfiles: Record<string, InstagramProfile> = {
  'therajeshchityal': {
    username: 'therajeshchityal',
    followers: 457,
    following: 27,
    posts: 60,
    profilePicUrl: 'https://scontent.cdninstagram.com/v/t51.82787-19/626935884_17899596549376440_6100310365906891796_n.jpg',
    biography: 'AI Tools & Business Growth • Helping entrepreneurs grow with AI 🤖',
    fullName: 'Rajesh Chityal | AI Tools & Business Growth',
    isDemo: true,
    source: 'demo',
  },
};

export async function getInstagramProfile(username: string): Promise<InstagramProfile | null> {
  console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

  // Try Apify first (real-time, fresh data)
  if (APIFY_KEY && APIFY_KEY.length > 10) {
    const apifyResult = await fetchFromApify(username);
    if (apifyResult) return apifyResult;
  } else {
    console.log(`[Scraper] No Apify key configured, skipping real-time fetch`);
  }

  // Fallback to instagram120 (instant but potentially stale)
  const instagram120Result = await fetchFromInstagram120(username);
  if (instagram120Result) return instagram120Result;

  // Last resort: demo data
  if (demoProfiles[username]) {
    console.log(`[Scraper] Returning demo data for @${username}`);
    return demoProfiles[username];
  }

  return null;
}

export async function getInstagramFollowers(username: string): Promise<number | null> {
  const profile = await getInstagramProfile(username);
  if (profile) {
    console.log(`[Scraper] Got ${profile.followers} followers from ${profile.source} for @${username}`);
    return profile.followers;
  }
  return null;
}
