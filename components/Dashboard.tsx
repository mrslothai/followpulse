'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, RefreshCw, Heart } from 'lucide-react';

interface ProfileData {
  username: string;
  followers: number;
  following: number;
  profilePicUrl: string;
  fullName: string;
  biography: string;
  isDemo?: boolean;
}

interface DashboardProps {
  initialUsername?: string;
}

export default function Dashboard({ initialUsername = 'therajeshchityal' }: DashboardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [inputUsername, setInputUsername] = useState(initialUsername);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previousFollowers, setPreviousFollowers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFollowers = async (user: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/followers?username=${user}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch profile');
        return;
      }

      setProfile(data.profile);
      setPreviousFollowers(data.previousFollowers);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Error fetching data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers(username);
  }, [username]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFollowers(username);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [username, autoRefresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
    }
  };

  const followerGain = profile && previousFollowers ? profile.followers - previousFollowers : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            FollowPulse
          </h1>
          <p className="text-purple-300">Track your Instagram followers in real-time</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter Instagram username..."
              className="flex-1 px-4 py-3 bg-slate-800 text-white placeholder-slate-400 rounded-lg border border-purple-500 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Demo Mode Notice */}
        {profile?.isDemo && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-300">
            ⚠️ <strong>Demo Mode:</strong> Add your RapidAPI key in Vercel to see real-time data.
          </div>
        )}

        {/* Main Card */}
        {profile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30">
              <div className="flex gap-6 items-center">
                <img
                  src={profile.profilePicUrl}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full border-4 border-purple-500"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                  <p className="text-purple-300">@{profile.username}</p>
                  <p className="text-slate-400 text-sm mt-2">{profile.biography}</p>
                </div>
              </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Followers Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-8 border border-purple-400/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-200 font-semibold">Followers</span>
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {profile.followers.toLocaleString()}
                </div>
                {followerGain !== 0 && (
                  <div className={`flex items-center gap-2 ${followerGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>{followerGain > 0 ? '+' : ''}{followerGain}</span>
                  </div>
                )}
              </div>

              {/* Following Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-8 border border-slate-600/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 font-semibold">Following</span>
                  <Heart className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-4xl font-bold text-white">
                  {profile.following.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Auto Refresh Toggle & Last Updated */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Auto Refresh</p>
                  <p className="text-slate-400 text-xs">Every 5 minutes</p>
                </div>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {autoRefresh ? 'On' : 'Off'}
              </button>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-center text-slate-400 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchFollowers(username)}
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
