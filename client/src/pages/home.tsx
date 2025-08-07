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
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/15 rounded-full blur-2xl floating-animation"></div>
        <div className="absolute top-60 right-16 w-24 h-24 bg-gradient-to-br from-purple-400/25 to-pink-400/20 rounded-full blur-xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-orange-400/18 to-yellow-400/12 rounded-full blur-2xl floating-animation" style={{ animationDelay: '4s' }}></div>
        
        {/* Moving Light Beams */}
        <div className="absolute top-1/4 left-1/4 w-1 h-40 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent rotating-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-32 bg-gradient-to-b from-transparent via-purple-400/25 to-transparent rotating-slow" style={{ animationDelay: '3s' }}></div>
        
        {/* Particle Effects */}
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400/40 rounded-full loading-pulse-soft"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-400/50 rounded-full loading-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Enhanced Hero Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-4">
                Trust Scanner
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
            </div>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Scan trust networks, analyze reputation patterns, and explore the Web3 credibility ecosystem
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: '🔍', text: 'Multi-Platform Search' },
                { icon: '⚡', text: 'Real-Time Analysis' },
                { icon: '🛡️', text: 'Trust Verification' },
                { icon: '📊', text: 'R4R Detection' }
              ].map((feature, index) => (
                <div
                  key={feature.text}
                  className="neo-card px-4 py-2 bg-opacity-30 floating-animation"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-slate-300 font-medium">{feature.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hero tagline */}
          <HeroTagline />
          
          {/* Enhanced Wallet Scanner */}
          <WalletScanner />
        </div>
        
        {/* Farcaster Auto-Detect Component */}
        {detectedUser && (
          <div className="w-full mb-8">
            <div className="neo-card p-4 floating-animation">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {detectedUser.pfpUrl ? (
                    <img 
                      src={detectedUser.pfpUrl} 
                      alt={detectedUser.displayName || 'Profile'}
                      className="w-12 h-12 rounded-full border-2 border-blue-400/50 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                      {detectedUser.displayName ? detectedUser.displayName[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-lg font-semibold">{detectedUser.displayName || 'Farcaster User'}</p>
                    <p className="text-slate-400 text-sm">@{detectedUser.username} • Your Profile</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleViewProfile(detectedUser.username)}
                  className="neo-button px-6 py-3"
                >
                  View Profile →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}