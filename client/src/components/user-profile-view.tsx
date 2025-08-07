import { useEffect, useState, useMemo, memo } from "react";
import { ArrowLeft, ExternalLink, Share2, Crown, Award, Zap, Shield, AlertTriangle, TrendingUp, Users, MessageSquare, Star, Calendar, Activity, BarChart3, Network, Clock, ArrowDownLeft, ArrowUpRight, ArrowUp, ArrowDown, X } from "lucide-react";
import { SiX, SiDiscord, SiFarcaster, SiTelegram } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTrustScore, useUserStats, useEnhancedProfile, useVouchActivities } from "@/hooks/use-ethos-api";
import { useR4RAnalysis } from "@/hooks/use-r4r-analysis";
import { useDashboardReviews } from "@/hooks/use-dashboard-reviews";
import { useAttestations, type SocialAttestation } from "@/hooks/use-attestations";
import { useWeeklyActivities } from "@/hooks/use-weekly-activities";
import { R4RDataSection } from "./r4r-data-section";
import { NextRankProgress } from "./next-rank-progress";


import { FarcasterShareButton } from "./farcaster-share-button";
import { formatNumber, formatXP, formatWeeklyGain, formatCurrency } from "@/lib/number-utils";
// Theme provider removed - dark mode only


interface UserProfileViewProps {
  user: any;
  onBackToSearch: () => void;
  onUserSearch?: (userData: any) => void;
  searchMode?: 'global' | 'farcaster';
}

// Official Ethos Protocol tier system (0-2800 range)
const getTierInfo = (score: number) => {
  if (score >= 2000) return { 
    icon: Crown, 
    tier: 'Exemplary',
    shortTier: 'EXC',
    colors: {
      bg: 'from-purple-500/20 to-violet-500/20',
      border: 'border-purple-400/30',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/20'
    }
  };
  if (score >= 1600) return { 
    icon: Award, 
    tier: 'Reputable',
    shortTier: 'REP',
    colors: {
      bg: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-400/30',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/20'
    }
  };
  if (score >= 1200) return { 
    icon: Zap, 
    tier: 'Neutral',
    shortTier: 'NEU',
    colors: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-400/30',
      text: 'text-blue-300',
      glow: 'shadow-blue-500/20'
    }
  };
  if (score >= 800) return { 
    icon: AlertTriangle, 
    tier: 'Questionable',
    shortTier: 'QUE',
    colors: {
      bg: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-400/30',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/20'
    }
  };
  return { 
    icon: Shield, 
    tier: 'Untrusted',
    shortTier: 'UNT',
    colors: {
      bg: 'from-gray-500/20 to-slate-500/20',
      border: 'border-gray-400/30',
      text: 'text-gray-400',
      glow: 'shadow-gray-500/20'
    }
  };
};

// Platform info functionality removed as requested by user

export function UserProfileView({ user, onBackToSearch, onUserSearch, searchMode = 'global' }: UserProfileViewProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'details'>('overview');
  
  // Get real-time data
  const { data: scoreData } = useTrustScore(user?.userkeys?.[0] || '', !!user);
  const { data: statsData } = useUserStats(user?.userkeys?.[0]);
  const { data: enhancedData, isLoading: isEnhancedQueryLoading } = useEnhancedProfile(user?.userkeys?.[0]);
  const { data: vouchData } = useVouchActivities(user?.userkeys?.[0] || '');
  const { data: weeklyActivitiesData, isLoading: isWeeklyActivitiesLoading } = useWeeklyActivities(user?.userkeys?.[0]);

  const score = (scoreData as any)?.success ? (scoreData as any).data?.score || user?.score || 0 : user?.score || 0;
  const realStats = (statsData as any)?.success ? (statsData as any).data : user?.stats;
  const enhancedProfile = (enhancedData as any)?.success ? (enhancedData as any).data : null;
  
  // Stats - vouches from stats API
  const vouchesReceived = realStats?.vouch?.received?.count || 0;
  
  const tierInfo = getTierInfo(score);
  const IconComponent = tierInfo.icon;

  // Helper functions
  const getTierColor = (score: number) => {
    if (score >= 2000) return 'bg-blue-100 text-blue-700';
    if (score >= 1600) return 'bg-green-100 text-green-700';
    if (score >= 1200) return 'bg-purple-100 text-purple-700';
    if (score >= 800) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Score animation
  useEffect(() => {
    if (score > 0) {
      const duration = 1000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.floor(score * easeOut));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [score]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.includes(':')) {
      const parts = address.split(':');
      const actualAddress = parts[parts.length - 1];
      if (actualAddress.length > 10) {
        return `${actualAddress.slice(0, 6)}...${actualAddress.slice(-4)}`;
      }
      return actualAddress;
    }
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  };


  
  // XP and ranking data - use enhanced profile data as primary source, strict null checking
  const xpTotal = enhancedProfile?.xpTotal || 0;
  const xpStreakDays = enhancedProfile?.xpStreakDays || null; // Strict null - only show if enhanced profile has data
  const leaderboardPosition = enhancedProfile?.leaderboardPosition ?? null;
  const weeklyXpGain = enhancedProfile?.weeklyXpGain || 0;

  // Status-based ring colors for profile avatar (dark mode only)
  const getStatusRingColor = (status: string, profileId: any) => {
    // Users without profileId (including profileId 0) and null/INACTIVE status need red rings  
    const hasNoProfile = !profileId || profileId === 0;
    if (hasNoProfile && (status === null || status === 'INACTIVE' || status === 'UNINITIALIZED')) {
      return 'ring-2 ring-red-400/60 shadow-lg shadow-red-400/20';
    }
    
    switch (status) {
      case 'ACTIVE':
        return 'ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-400/20';
      case 'INACTIVE':
        return 'ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-400/20';
      case 'UNINITIALIZED':
        return 'ring-2 ring-red-400/60 shadow-lg shadow-red-400/20';
      default:
        return 'ring-2 ring-gray-500/40 shadow-lg shadow-gray-500/20';
    }
  };
  
  // Simple state for score animation
  const [showRankPopup, setShowRankPopup] = useState(false);



  // Simple score animation on load
  useEffect(() => {
    if (score > 0 && animatedScore === 0) {
      const duration = 1000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(score * easeOut));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (score > 0 && animatedScore !== score) {
      setAnimatedScore(score);
    }
  }, [score]);

  const handleViewOnEthos = () => {
    if (user?.userkeys?.[0]) {
      // Use the displayName or username to construct the Ethos profile URL
      const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.username || 'user';
      const profileUrl = `https://app.ethos.network/profile/x/${username}`;
      window.open(profileUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#c7c8c9]">
      <div className="max-w-sm mx-auto px-6 py-8">
        {/* Header with Back button */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBackToSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-gray-700 hover:shadow-lg transition-all shadow-md border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Header Card - User Profile */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-md border-0">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={user.avatarUrl && !user.avatarUrl.includes('default_profile') ? user.avatarUrl : undefined} 
                alt={user.displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl font-bold">
                {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.displayName}
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                {formatAddress(user?.userkeys?.[0] || '')}
              </p>
              
              {/* Status Badge */}
              {score > 0 && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTierColor(score)}`}>
                  <IconComponent className="w-3 h-3" />
                  <span>{tierInfo.tier}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Score Display */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-md border-0 text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {animatedScore}
          </div>
          <div className="text-gray-500 text-base mb-4">
            Trust Score
          </div>
          {score > 0 && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getTierColor(score)}`}>
              <IconComponent className="w-4 h-4" />
              <span>{tierInfo.tier}</span>
            </div>
          )}
        </div>







        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-3xl p-2 mb-6 shadow-sm border-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
        </div>
                
        {/* Dynamic Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Global Rank Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Global Rank</h3>
                  <p className="text-sm text-gray-500">Network position</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {enhancedProfile?.leaderboardPosition ? `#${enhancedProfile.leaderboardPosition}` : 'N/A'}
              </div>
            </div>

            {/* XP Points Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">XP Points</h3>
                  <p className="text-sm text-gray-500">Experience earned</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(enhancedProfile?.xpTotal || user?.xpTotal || 0)}
              </div>
            </div>

            {/* Vouches Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Vouches</h3>
                  <p className="text-sm text-gray-500">Received</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {vouchesReceived}
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Activity</h3>
                  <p className="text-sm text-gray-500">Recent actions</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {enhancedProfile?.xpStreakDays || 0}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl p-8 shadow-md border-0">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <p className="text-gray-500">Activity data will be displayed here...</p>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-3xl p-8 shadow-md border-0">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Wallet Address:</span>
                <p className="text-gray-900 font-mono text-sm">
                  {user?.userkeys?.[0] || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Trust Level:</span>
                <p className="text-gray-900">{tierInfo.tier}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <p className="text-gray-900">{enhancedProfile?.status || 'Unknown'}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
