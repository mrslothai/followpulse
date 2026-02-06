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
