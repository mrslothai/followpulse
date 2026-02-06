import { NextRequest, NextResponse } from 'next/server';
import { getInstagramFollowers, getInstagramProfile } from '@/lib/instagram-scraper';
import { database } from '@/lib/firebase';
import { ref, set, get, update } from 'firebase/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'therajeshchityal';

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Fetch current followers
    const profile = await getInstagramProfile(username);

    if (!profile) {
      return NextResponse.json(
        { error: 'Could not fetch Instagram profile' },
        { status: 400 }
      );
    }

    // Store in Firebase
    const userRef = ref(database, `users/${username}`);
    const timestamp = new Date().toISOString();

    const userSnapshot = await get(userRef);
    const existingData = userSnapshot.val() || {};

    const historyRef = ref(database, `users/${username}/history/${timestamp}`);
    await set(historyRef, {
      followers: profile.followers,
      timestamp,
    });

    await update(userRef, {
      lastUpdate: timestamp,
      currentFollowers: profile.followers,
      ...profile,
    });

    return NextResponse.json({
      success: true,
      profile,
      previousFollowers: existingData.currentFollowers || 0,
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const profile = await getInstagramProfile(username);

    if (!profile) {
      return NextResponse.json(
        { error: 'Could not fetch Instagram profile' },
        { status: 400 }
      );
    }

    // Store in Firebase
    const userRef = ref(database, `users/${username}`);
    const timestamp = new Date().toISOString();

    const historyRef = ref(database, `users/${username}/history/${timestamp}`);
    await set(historyRef, {
      followers: profile.followers,
      timestamp,
    });

    await update(userRef, {
      lastUpdate: timestamp,
      currentFollowers: profile.followers,
      ...profile,
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error in POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
