import axios from 'axios';

export async function getInstagramProfile(username: string) {
  try {
    console.log(`[Scraper] Fetching Instagram profile for @${username}...`);

    // Use Instagram's official API endpoint (works better on serverless)
    const response = await axios.get(
      `https://www.instagram.com/${username}/?__a=1&__w=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    const user = data?.user;

    if (user) {
      console.log(`[Scraper] Successfully fetched real data for @${username}`);
      return {
        username: user.username,
        followers: user.edge_followed_by?.count || user.follower_count || 0,
        following: user.edge_follow?.count || user.following_count || 0,
        profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
        biography: user.biography || '',
        fullName: user.full_name || user.username,
      };
    }

    return null;
  } catch (error) {
    console.error(`[Scraper] Error with API endpoint:`, error);

    // Fallback: Try alternative endpoint
    try {
      const altResponse = await axios.get(
        `https://instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          timeout: 15000,
        }
      );

      const user = altResponse.data?.data?.user;
      if (user) {
        return {
          username: user.username,
          followers: user.edge_followed_by?.count || 0,
          following: user.edge_follow?.count || 0,
          profilePicUrl: user.profile_pic_url_hd || '',
          biography: user.biography || '',
          fullName: user.full_name || user.username,
        };
      }
    } catch (altError) {
      console.error(`[Scraper] Alternative endpoint also failed:`, altError);
    }

    console.log(`[Scraper] Could not fetch data for @${username}`);
    return null;
  }
}

export async function getInstagramFollowers(username: string): Promise<number | null> {
  try {
    const profile = await getInstagramProfile(username);
    if (profile) {
      console.log(`[Scraper] Got ${profile.followers} followers for @${username}`);
      return profile.followers;
    }
    return null;
  } catch (error) {
    console.error(`[Scraper] Error fetching followers:`, error);
    return null;
  }
}
