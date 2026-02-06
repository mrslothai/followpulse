// Demo data while we set up official Instagram API
// In production, replace this with Instagram Graph API credentials
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

    // For demo/testing: Return demo data
    if (demoProfiles[username]) {
      console.log(`[Scraper] ✅ Returning demo data for @${username}`);
      return demoProfiles[username];
    }

    // In production with official Instagram API:
    // const response = await axios.get(
    //   `https://graph.instagram.com/me?fields=id,username,name,biography,website,profile_picture_url,followers_count&access_token=${process.env.INSTAGRAM_GRAPH_API_TOKEN}`
    // );

    console.log(`[Scraper] No data found for @${username}`);
    return null;
  } catch (error: any) {
    console.error(`[Scraper] Error fetching Instagram profile:`, error.message);
    
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
