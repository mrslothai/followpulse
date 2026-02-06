# Firebase Setup Guide for FollowPulse

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a new project"
3. Project name: `FollowPulse`
4. Accept terms and click Continue
5. Disable Google Analytics (optional) → Create Project
6. Wait for project to initialize (1-2 minutes)

## Step 2: Enable Realtime Database

1. In Firebase console, click "Realtime Database" (left sidebar)
2. Click "Create Database"
3. Choose **India** as region (lowest latency)
4. Choose **Start in test mode** (for MVP, we'll secure later)
5. Enable

## Step 3: Get Firebase Config

1. Go to Project Settings (gear icon, top-left)
2. Go to "General" tab
3. Scroll to "Your apps" section
4. If no app yet, click "Add app" and choose "Web" (</> icon)
5. Register app (any name like "FollowPulse Web")
6. Copy the firebaseConfig object
7. It will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "followpulse-xxxx.firebaseapp.com",
  databaseURL: "https://followpulse-xxxx.firebaseio.com",
  projectId: "followpulse-xxxx",
  storageBucket: "followpulse-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Step 4: Update Environment Variables

1. Open `.env.local` in the FollowPulse project
2. Update each value from your firebaseConfig:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (apiKey)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=followpulse-xxxx.firebaseapp.com (authDomain)
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://followpulse-xxxx.firebaseio.com (databaseURL)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=followpulse-xxxx (projectId)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=followpulse-xxxx.appspot.com (storageBucket)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789 (messagingSenderId)
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef... (appId)
```

## Step 5: Test Locally

```bash
cd /Users/sloth/.openclaw/workspace/followpulse
npm run dev
```

Visit `http://localhost:3000` and try searching for `therajeshchityal`

## Step 6: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign in with GitHub
3. Import the `followpulse` repository
4. Add environment variables (same as .env.local)
5. Deploy!

---

**Done!** Your app is now live and tracking followers in real-time. 🚀

## Troubleshooting

**"Connection refused" error?**
- Make sure all Firebase env variables are set correctly
- Check database URL format (ends with `.firebaseio.com`)

**"Instagram profile not found"?**
- Make sure username is public on Instagram
- Wait a few minutes and retry (Instagram rate limits)

**"Build failed on Vercel"?**
- Check Build Logs tab
- Make sure all env variables are set
- Make sure Node.js version is 18+

---

Questions? Let me know! 🦥
