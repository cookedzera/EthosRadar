import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { WalletScanner } from '@/components/wallet-scanner';
import { UserProfileView } from '@/components/user-profile-view';

import { HeroTagline } from '@/components/hero-tagline';

import { useUserProfile } from '@/hooks/use-ethos-api';
import { sdk } from '@farcaster/frame-sdk';

interface DetectedFarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export default function Home() {
  const { user, searchMode, setUser, clearUser } = useUserProfile();
  const [detectedUser, setDetectedUser] = useState<DetectedFarcasterUser | null>(null);

  // Farcaster user auto-detection hook
  useEffect(() => {
    const detectFarcasterUser = async () => {
      try {
        const context = await sdk.context;
        if (context?.user) {
          setDetectedUser({
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || ''
          });
        }
      } catch (error) {
        // Farcaster context not available, user not in frame environment
        console.log('Farcaster context not available - this is expected in regular browser');
        
        // DEMO MODE: For testing purposes, we can simulate a detected user
        // Remove this in production or when testing in actual Farcaster environment
        if (window.location.hostname.includes('replit')) {
          // Reduce demo delay for faster loading perception
          setTimeout(() => {
            setDetectedUser({
              fid: 123456,
              username: 'cookedzera',
              displayName: 'CookedZera',
              pfpUrl: 'https://i.imgur.com/example.jpg' // This will fail and show fallback
            });
          }, 500); // Reduced from 2000ms to 500ms
        }
      }
    };
    
    detectFarcasterUser();
  }, []);

  // Check for URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      
      if (userParam && !user) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          setUser(userData);
          // Clean up the URL  
          window.history.replaceState({}, '', '/');
        } catch (error) {
          // Invalid user data in URL, ignore
        }
      }
    }
  }, [user, setUser]);

  const handleBackToSearch = () => {
    clearUser();
  };

  const handleViewProfile = async (username: string) => {
    try {
      // Use regular search endpoint - same as typing in search bar
      const response = await fetch('/api/search-user-farcaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ farcasterUsername: username })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Use the same profile view as regular search - no special handling needed
          setUser(result.data, 'farcaster');
        } else {
          // Handle error silently in production
        }
      } else {
        // Handle error silently in production
      }
    } catch (error) {
      // Handle error silently in production
    }
  };

  if (user) {
    // Use the same unified profile view for all users - no special Farcaster handling
    return (
      <UserProfileView user={user} onBackToSearch={handleBackToSearch} onUserSearch={setUser} searchMode={searchMode} />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Premium Background with Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50"></div>
        
        {/* Premium Floating Orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-full blur-3xl float-bounce"></div>
        <div className="absolute top-60 right-16 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/15 rounded-full blur-2xl float-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-br from-cyan-500/12 to-blue-600/8 rounded-full blur-3xl float-bounce" style={{ animationDelay: '4s' }}></div>
        
        {/* Reference-Style Floating Particles */}
        <div className="floating-particle w-2 h-2 top-1/4 left-1/4" style={{ animationDelay: '0s' }}></div>
        <div className="floating-particle w-1 h-1 top-1/3 right-1/3" style={{ animationDelay: '1s' }}></div>
        <div className="floating-particle w-3 h-3 bottom-1/3 left-1/3" style={{ animationDelay: '2s' }}></div>
        <div className="floating-particle w-1.5 h-1.5 top-1/2 right-1/4" style={{ animationDelay: '3s' }}></div>
        <div className="floating-particle w-2 h-2 bottom-1/4 right-1/2" style={{ animationDelay: '4s' }}></div>
        <div className="floating-particle w-1 h-1 top-3/4 left-1/5" style={{ animationDelay: '5s' }}></div>
        
        {/* Subtle Light Beams */}
        <div className="absolute top-1/3 left-1/3 w-1 h-60 bg-gradient-to-b from-transparent via-white/5 to-transparent transform rotate-12 pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-40 bg-gradient-to-b from-transparent via-white/3 to-transparent transform -rotate-12 pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main Content with Fresh Warpcast Design */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* TOP PRIORITY: SEARCH BAR - Premium Glass Design */}
          <div className="glass-search-container mb-12">
            <div className="glass-card search-hero">
              <div className="search-header mb-6">
                <h2 className="text-white text-2xl font-semibold mb-2">Search Web3 Trust Scores</h2>
                <p className="text-white/70">Enter @username or wallet address</p>
              </div>
              <WalletScanner />
              
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['vitalik.eth', 'cookedzera', 'dwr.eth', 'jessepollak'].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="glass-pill px-4 py-2 text-sm text-white/80 hover:text-white transition-all hover-scale"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* WELCOME SECTION - Premium Glass Card */}
          <div className="glass-card welcome-card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Discover Web3 Trust Scores
                </h1>
                <p className="text-white/70 text-lg">
                  Powered by Ethos Network
                </p>
              </div>
              <div className="glass-badge">
                <img 
                  src="https://i.ibb.co/jPDG2NX5/ethos-network1719934757538-removebg-preview.png" 
                  alt="Ethos Logo" 
                  className="w-8 h-8 opacity-80"
                />
              </div>
            </div>
          </div>

          {/* FEATURE CARDS GRID - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Network Stats Card */}
            <div className="glass-card feature-card">
              <div className="flex items-center mb-4">
                <div className="glass-icon-container mr-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">Network Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">125,847</div>
                <div className="text-white/60 text-sm">Active Users</div>
                <div className="glass-trend-indicator">
                  <span className="text-green-400 text-sm">↗ +2.4%</span>
                </div>
              </div>
            </div>

            {/* Trust Levels Card */}
            <div className="glass-card feature-card">
              <div className="flex items-center mb-4">
                <div className="glass-icon-container mr-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">Trust Levels</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">1,847</div>
                <div className="text-white/60 text-sm">Average Score</div>
                <div className="trust-level-indicator">
                  <span className="text-blue-400 text-sm">● Reputable</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="glass-card feature-card">
              <div className="flex items-center mb-4">
                <div className="glass-icon-container mr-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">3,429</div>
                <div className="text-white/60 text-sm">Scans Today</div>
                <div className="mini-chart">
                  <div className="flex items-end space-x-1 h-8">
                    {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="bg-purple-400/50 rounded-sm w-2"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-card feature-card">
              <div className="flex items-center mb-4">
                <div className="glass-icon-container mr-4">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="glass-action-button w-full">
                  Scan Profile
                </button>
                <button className="glass-action-button w-full">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
          
          {/* RECENT/TRENDING SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Recently Searched */}
            <div className="glass-card">
              <h3 className="text-white font-semibold text-lg mb-4">Recently Searched</h3>
              <div className="space-y-3">
                {['vitalik.eth', 'cookedzera.eth', 'dwr.eth'].map((user) => (
                  <div key={user} className="glass-mini-card">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">{user}</span>
                      <span className="text-white/60 text-sm">2h ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Profiles */}
            <div className="glass-card">
              <h3 className="text-white font-semibold text-lg mb-4">Trending Profiles</h3>
              <div className="space-y-3">
                {[
                  { user: 'jessepollak', score: '2,847', badge: '👑' },
                  { user: 'dwr.eth', score: '2,654', badge: '🏆' },
                  { user: 'vitalik.eth', score: '2,543', badge: '⭐' }
                ].map((profile) => (
                  <div key={profile.user} className="glass-mini-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{profile.badge}</span>
                        <span className="text-white/80">{profile.user}</span>
                      </div>
                      <span className="text-white/60 text-sm">{profile.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM STATUS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="glass-status-badge">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
                <span className="text-white/80 text-sm">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {['API', 'Database', 'Network'].map((service) => (
                <div key={service} className="glass-chip">
                  <span className="text-white/70 text-xs">{service}</span>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-2"></div>
                </div>
              ))}
            </div>

            <button className="glass-secondary-button">
              Switch to Farcaster
            </button>
          </div>
          
        </div>
        
        {/* Enhanced Farcaster Auto-Detect */}
        {detectedUser && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="warp-card p-6 slide-up-fade">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {detectedUser.pfpUrl ? (
                    <img 
                      src={detectedUser.pfpUrl} 
                      alt={detectedUser.displayName || 'Profile'}
                      className="w-16 h-16 rounded-full border-3 border-purple-400/50 object-cover hover-scale"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-3 border-purple-400/50 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold hover-scale">
                      {detectedUser.displayName ? detectedUser.displayName[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-xl font-bold gradient-warp">{detectedUser.displayName || 'Farcaster User'}</p>
                    <p className="text-white/60 text-base">@{detectedUser.username} • Detected Profile</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewProfile(detectedUser.username)}
                  className="warp-button px-8 py-4 text-lg font-bold"
                >
                  Analyze Trust →
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}