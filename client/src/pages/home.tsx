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
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Warpcast Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Base Chain Orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-full blur-3xl float-bounce"></div>
        <div className="absolute top-60 right-16 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/15 rounded-full blur-2xl float-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-br from-cyan-500/12 to-blue-600/8 rounded-full blur-3xl float-bounce" style={{ animationDelay: '4s' }}></div>
        
        {/* Warpcast Inspired Light Beams */}
        <div className="absolute top-1/3 left-1/3 w-2 h-60 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent transform rotate-12 pulse-accent"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-40 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent transform -rotate-12 pulse-accent" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-purple-400/60 rounded-full pulse-accent"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-cyan-400/70 rounded-full pulse-accent" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-pink-400/80 rounded-full pulse-accent" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Main Content with Fresh Warpcast Design */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Section - Warpcast Style */}
          <div className="text-center space-y-8 slide-up-fade">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black gradient-warp mb-6 font-display">
                TrustRadar
              </h1>
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-full blur-3xl pulse-accent"></div>
            </div>
            
            <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
              The most advanced trust network scanner for <span className="gradient-base font-bold">Warpcast</span> and <span className="gradient-base font-bold">Base</span> users
            </p>
            
            {/* Modern Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { icon: '🔍', text: 'Smart Search', color: 'from-purple-500/20 to-pink-500/20' },
                { icon: '⚡', text: 'Instant Results', color: 'from-cyan-500/20 to-blue-500/20' },
                { icon: '🛡️', text: 'Trust Verified', color: 'from-green-500/20 to-emerald-500/20' },
                { icon: '📊', text: 'Deep Analytics', color: 'from-orange-500/20 to-red-500/20' }
              ].map((feature, index) => (
                <div
                  key={feature.text}
                  className={`warp-card p-4 text-center hover-scale scale-in bg-gradient-to-br ${feature.color}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-white font-semibold text-sm">{feature.text}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Hero Tagline */}
          <div className="slide-up-fade" style={{ animationDelay: '0.3s' }}>
            <HeroTagline />
          </div>
          
          {/* Main Scanner - Warpcast Design */}
          <div className="slide-up-fade" style={{ animationDelay: '0.5s' }}>
            <WalletScanner />
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