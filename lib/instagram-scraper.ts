import axios from 'axios';

export async function getInstagramFollowers(username: string): Promise<number | null> {
  try {
    // Using Instagram's public API endpoint
    const response = await axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    if (response.data?.data?.user?.edge_followed_by?.count) {
      return response.data.data.user.edge_followed_by.count;
    }

    return null;
  } catch (error) {
    console.error('Error fetching Instagram followers:', error);
    return null;
  }
}

export async function getInstagramProfile(username: string) {
  try {
    const response = await axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    const user = response.data?.data?.user;
    if (user) {
      return {
        username: user.username,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        profilePicUrl: user.profile_pic_url_hd,
        biography: user.biography,
        fullName: user.full_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return null;
  }
}
