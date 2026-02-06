# FollowPulse - Live Instagram Follower Tracker

A real-time Instagram follower tracking app for creators. Track your growth, monitor milestones, and grow your audience with data-driven insights.

## Features ✨

- **Live Follower Count** - Real-time updates of your Instagram followers
- **Growth Tracking** - See follower gains in real-time
- **Profile Info** - Display your bio, profile picture, and following count
- **Auto Refresh** - Automatic updates every 5 minutes
- **Manual Refresh** - Refresh anytime with one click
- **Beautiful Dashboard** - Dark theme optimized for creators
- **Mobile Friendly** - Works on desktop and mobile devices

## Tech Stack 🛠️

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Realtime Database
- **Hosting**: Vercel
- **Scraping**: Axios (Instagram public API)

## Setup Instructions 🚀

### 1. Clone the Repository
```bash
cd followpulse
npm install
```

### 2. Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Realtime Database (select India region for best latency)
4. Get your Firebase config from Project Settings
5. Update `.env.local` with your Firebase credentials

### 3. Update Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Firebase details:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

During deployment, add your environment variables in Vercel dashboard.

## How It Works 🔄

1. **Fetch**: App fetches your Instagram follower count via public API
2. **Store**: Data is stored in Firebase Realtime Database with timestamp
3. **Display**: Dashboard shows current followers and growth
4. **Track**: Historical data allows you to see growth trends
5. **Notify**: Get notifications when you hit milestones (optional feature coming soon)

## Features Coming Soon 🎯

- [ ] Multiple account tracking
- [ ] Growth charts and analytics
- [ ] Milestone notifications
- [ ] Email reports
- [ ] Engagement metrics
- [ ] Competitor comparison
- [ ] Mobile app (React Native)
- [ ] Browser extension

## Pricing 💰

**Free Plan (MVP)**:
- Live follower tracking
- Manual refresh
- Auto-refresh every 5 minutes

**Premium Plan** (coming soon):
- Hourly snapshots
- Growth analytics
- Milestone alerts
- Email reports
- Multiple accounts

**Pricing**: ₹200-300/month for India, $5/month for global

## API Routes 📡

### GET /api/followers?username=USERNAME
Fetch follower data for a specific Instagram username.

**Response**:
```json
{
  "success": true,
  "profile": {
    "username": "therajeshchityal",
    "followers": 241,
    "following": 25,
    "profilePicUrl": "...",
    "fullName": "Rajesh Chityal",
    "biography": "..."
  },
  "previousFollowers": 240
}
```

### POST /api/followers
Store follower data in Firebase.

**Request**:
```json
{
  "username": "therajeshchityal"
}
```

## File Structure 📁

```
followpulse/
├── app/
│   ├── api/
│   │   └── followers/
│   │       └── route.ts      # API for fetching/storing followers
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── Dashboard.tsx          # Main UI component
├── lib/
│   ├── firebase.ts            # Firebase config
│   └── instagram-scraper.ts   # Instagram data fetching
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                 # Environment variables
```

## Troubleshooting 🔧

### Firebase Connection Error
- Check if `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct
- Make sure Realtime Database is enabled in Firebase Console
- Check CORS settings in Firebase

### Instagram API Errors
- Instagram may block requests occasionally
- Try again in a few minutes
- Some usernames might require authentication

### Deploy Issues
- Make sure all environment variables are set in Vercel
- Check Build Logs in Vercel dashboard
- Clear cache and rebuild

## Contributing 🤝

This is a personal project, but feel free to fork and modify for your own use.

## License 📄

MIT License - Feel free to use this project for personal or commercial use.

---

**Built by Sloth for Rajesh** 🦥💜

Questions? Issues? Create a GitHub issue or reach out!
