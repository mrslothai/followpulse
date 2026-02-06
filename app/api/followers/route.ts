import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProfile } from '@/lib/instagram-scraper';

let firebaseAvailable = false;
let database: any = null;
let ref: any;
let set: any;
let get: any;
let update: any;

// Try to import Firebase on first use
async function ensureFirebase() {
  if (firebaseAvailable || database) return;
  
  try {
    const { database: db } = await import('@/lib/firebase');
    if (db) {
      const fbModule = await import('firebase/database');
      database = db;
      ref = fbModule.ref;
      set = fbModule.set;
      get = fbModule.get;
      update = fbModule.update;
      firebaseAvailable = true;
    }
  } catch (error) {
    console.warn('Firebase not available. Install credentials in .env.local');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'therajeshchityal';
    const forceRefresh = searchParams.get('force') === 'true';

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching followers for @${username}${forceRefresh ? ' (force refresh)' : ''}...`);

    // Fetch current followers (with retry for fresh data)
    let profile = await getInstagramProfile(username);
    
    // If force refresh is requested, try again
    if (forceRefresh && profile) {
      console.log(`[API] Force refresh requested, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryProfile = await getInstagramProfile(username);
      if (retryProfile && retryProfile.followers > profile.followers) {
        profile = retryProfile;
        console.log(`[API] Got fresher data on retry: ${retryProfile.followers} followers`);
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Could not fetch Instagram profile. Check username and try again.' },
        { status: 400 }
      );
    }

    // Try to store in Firebase if available
    await ensureFirebase();
    
    if (firebaseAvailable && database) {
      try {
        const userRef = ref(database, `users/${username}`);
        const timestamp = new Date().toISOString();
        const sanitizedTimestamp = timestamp.replace(/[.\-:]/g, '');

        const userSnapshot = await get(userRef);
        const existingData = userSnapshot.val() || {};

        const historyRef = ref(database, `users/${username}/history/${sanitizedTimestamp}`);
        await set(historyRef, {
          followers: profile.followers,
          timestamp,
        });

        await update(userRef, {
          lastUpdate: timestamp,
          currentFollowers: profile.followers,
          ...profile,
        });
      } catch (dbError) {
        console.warn('Could not store in Firebase:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      previousFollowers: 0,
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

    // Try to store in Firebase if available
    await ensureFirebase();
    
    if (firebaseAvailable && database) {
      try {
        const userRef = ref(database, `users/${username}`);
        const timestamp = new Date().toISOString();
        const sanitizedTimestamp = timestamp.replace(/[.\-:]/g, '');

        const historyRef = ref(database, `users/${username}/history/${sanitizedTimestamp}`);
        await set(historyRef, {
          followers: profile.followers,
          timestamp,
        });

        await update(userRef, {
          lastUpdate: timestamp,
          currentFollowers: profile.followers,
          ...profile,
        });
      } catch (dbError) {
        console.warn('Could not store in Firebase:', dbError);
      }
    }

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
