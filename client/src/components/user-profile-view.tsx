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
  const [activeTab, setActiveTab] = useState<'overview' | 'vouch-intel' | 'r4r-analysis'>('overview');
  
  // Get real-time data
  const { data: scoreData } = useTrustScore(user?.userkeys?.[0] || '', !!user);
  const { data: statsData } = useUserStats(user?.userkeys?.[0]);
  const { data: enhancedData, isLoading: isEnhancedQueryLoading } = useEnhancedProfile(user?.userkeys?.[0]);
  const { data: vouchData } = useVouchActivities(user?.userkeys?.[0] || '');
  const { data: weeklyActivitiesData, isLoading: isWeeklyActivitiesLoading } = useWeeklyActivities(user?.userkeys?.[0]);
  const { data: r4rData, isLoading: isR4RLoading, error: r4rError } = useR4RAnalysis(user?.userkeys?.[0]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 pt-4 pb-12">
        {/* Hidden Header for Clean Profile View */}

        {/* Hero Section - Enhanced Profile Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl border border-white/30 relative overflow-hidden mt-4">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Enhanced Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white/50 shadow-2xl">
                    <AvatarImage 
                      src={user.avatarUrl && !user.avatarUrl.includes('default_profile') ? user.avatarUrl : undefined} 
                      alt={user.displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 text-4xl font-bold">
                      {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status Indicator */}
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 ring-4 ring-white shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Trust Score - Large Display */}
                <div className="mt-6 text-center">
                  <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {animatedScore}
                  </div>
                  <div className="text-gray-600 font-medium">Trust Score</div>
                </div>
              </div>

              {/* User Information */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-black text-gray-900 mb-3">
                  {user.displayName}
                </h1>
                
                <p className="text-gray-600 text-lg mb-4">
                  {formatAddress(user?.userkeys?.[0] || '')}
                </p>
                
                {/* Enhanced Tier Badge */}
                {score > 0 && (
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-lg font-bold shadow-lg ${getTierColor(score)} mb-6`}>
                    <IconComponent className="w-6 h-6" />
                    <span>{tierInfo.tier}</span>
                  </div>
                )}

                {/* Quick Stats Grid with Back Button */}
                <div className="relative">
                  <button
                    onClick={onBackToSearch}
                    className="absolute -top-2 left-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-all shadow-md border border-white/30 z-10"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                  </button>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/60 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/30">
                      <div className="text-2xl font-bold text-gray-900">{vouchesReceived}</div>
                      <div className="text-sm text-gray-600">Vouches</div>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/30">
                      <div className="text-2xl font-bold text-gray-900">{realStats?.review?.received?.positive || 0}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/30">
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(user?.xpTotal || 0)}</div>
                      <div className="text-sm text-gray-600">XP Total</div>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/30 relative">
                      <div className="text-2xl font-bold text-gray-900">#{user?.id || '—'}</div>
                      <div className="text-sm text-gray-600">Profile ID</div>
                      
                      {/* Action Buttons - Positioned in top right */}
                      <div className="absolute -top-8 right-0 flex items-center gap-2">
                        <button
                          onClick={handleViewOnEthos}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="font-medium">Ethos</span>
                        </button>
                        <FarcasterShareButton 
                          user={user}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>







        {/* Enhanced Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-2 mb-8 shadow-lg border border-white/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <BarChart3 className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vouch-intel')}
              className={`flex-1 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'vouch-intel'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <Users className="w-4 h-4" />
                Vouch Intel
              </div>
            </button>
            <button
              onClick={() => setActiveTab('r4r-analysis')}
              className={`flex-1 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'r4r-analysis'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <AlertTriangle className="w-4 h-4" />
                R4R Analysis
              </div>
            </button>
          </div>
        </div>
                
        {/* Enhanced Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Vouches</h3>
                    <p className="text-xs text-gray-500">Trust endorsements</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {vouchesReceived}
                </div>
                <div className="text-sm text-gray-600">
                  Total received
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Reviews</h3>
                    <p className="text-xs text-gray-500">Community feedback</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {realStats?.review?.received?.positive || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Positive reviews
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">XP Total</h3>
                    <p className="text-xs text-gray-500">Experience points</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {formatNumber(user?.xpTotal || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Network contribution
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Rank</h3>
                    <p className="text-xs text-gray-500">Network position</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  #{enhancedProfile?.leaderboardPosition || user?.id || '—'}
                </div>
                <div className="text-sm text-gray-600">
                  Global position
                </div>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            {weeklyActivitiesData && (weeklyActivitiesData as any).success && (weeklyActivitiesData as any).data && (
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {(Array.isArray((weeklyActivitiesData as any).data) ? (weeklyActivitiesData as any).data.slice(0, 5) : []).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-white/30 hover:bg-white/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                        <span className="font-medium text-gray-900">{activity.type || 'Network Activity'}</span>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {activity.timestamp ? new Date(activity.timestamp * 1000).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))}
                  {(!Array.isArray((weeklyActivitiesData as any).data) || (weeklyActivitiesData as any).data.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No recent activity found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vouch-intel' && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Vouch Intelligence</h3>
            </div>
            
            <div className="space-y-6">
              {/* Enhanced Vouch Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Received</h4>
                      <p className="text-sm text-gray-600">Vouches for you</p>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-3">
                    {vouchesReceived}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Value: {realStats?.vouch?.received?.amountWeiTotal ? 
                      `${(parseInt(realStats.vouch.received.amountWeiTotal) / 1e18).toFixed(4)} ETH` : 
                      '0 ETH'
                    }
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Given</h4>
                      <p className="text-sm text-gray-600">Vouches by you</p>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-3">
                    {realStats?.vouch?.given?.count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Value: {realStats?.vouch?.given?.amountWeiTotal ? 
                      `${(parseInt(realStats.vouch.given.amountWeiTotal) / 1e18).toFixed(4)} ETH` : 
                      '0 ETH'
                    }
                  </div>
                </div>
              </div>

              {/* Recent Vouch Activities */}
              {vouchData && (vouchData as any).success && (vouchData as any).data && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-6">Recent Vouch Activities</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Received Vouches */}
                    {((vouchData as any).data.received || []).slice(0, 5).map((vouch: any, index: number) => {
                      const userInfo = vouch.voucherInfo;
                      const displayName = userInfo?.displayName || userInfo?.username || 'Anonymous';
                      const ethAmount = parseFloat(vouch.amountEth || 0);
                      const usdAmount = ((vouchData as any).data.ethUsdRate || 3400) * ethAmount;
                      
                      return (
                        <div key={`received-${index}`} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-white/60 hover:bg-white transition-all shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"></div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">Received vouch</div>
                              <div className="text-xs font-medium text-gray-600">{displayName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {ethAmount.toFixed(4)} ETH
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                              ${usdAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Given Vouches */}
                    {((vouchData as any).data.given || []).slice(0, 5).map((vouch: any, index: number) => {
                      const userInfo = vouch.voucheeInfo;
                      const displayName = userInfo?.displayName || userInfo?.username || 'Anonymous';
                      const ethAmount = parseFloat(vouch.amountEth || 0);
                      const usdAmount = ((vouchData as any).data.ethUsdRate || 3400) * ethAmount;
                      
                      return (
                        <div key={`given-${index}`} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-white/60 hover:bg-white transition-all shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"></div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">Gave vouch</div>
                              <div className="text-xs font-medium text-gray-600">{displayName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {ethAmount.toFixed(4)} ETH
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                              ${usdAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(((vouchData as any).data.received || []).length === 0 && ((vouchData as any).data.given || []).length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No vouch activities found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vouch Network Insights */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-4">Network Insights</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Trust Ratio</div>
                    <div className="text-lg font-bold text-gray-900">
                      {vouchesReceived > 0 ? 
                        `${((realStats?.vouch?.given?.count || 0) / vouchesReceived).toFixed(2)}` : 
                        '—'
                      }
                    </div>
                    <div className="text-xs text-gray-600">Given/Received ratio</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average Value</div>
                    <div className="text-lg font-bold text-gray-900">
                      {vouchesReceived > 0 && realStats?.vouch?.received?.amountWeiTotal ? 
                        `${(parseInt(realStats.vouch.received.amountWeiTotal) / 1e18 / vouchesReceived).toFixed(4)} ETH` : 
                        '—'
                      }
                    </div>
                    <div className="text-xs text-gray-600">Per vouch received</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'r4r-analysis' && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">R4R Analysis</h3>
            </div>
            
            {isR4RLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500">Analyzing review patterns...</span>
              </div>
            )}

            {r4rError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 text-sm">Unable to load R4R analysis</span>
                </div>
              </div>
            )}

            {r4rData && !isR4RLoading && (
              <div className="space-y-6">
                {/* R4R Score */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">R4R Risk Score</h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r4rData.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                      r4rData.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r4rData.riskLevel} Risk
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {r4rData.r4rScore.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Likelihood of reputation farming activity
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <div className="text-sm text-gray-500">Reviews Received</div>
                    <div className="text-xl font-bold text-gray-900">
                      {r4rData.totalReviewsReceived || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <div className="text-sm text-gray-500">Reciprocal Reviews</div>
                    <div className="text-xl font-bold text-gray-900">
                      {r4rData.reciprocalReviews || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <div className="text-sm text-gray-500">Positive Reviews</div>
                    <div className="text-xl font-bold text-green-600">
                      {realStats?.review?.received?.positive || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <div className="text-sm text-gray-500">Quick Reciprocals</div>
                    <div className="text-xl font-bold text-orange-600">
                      {r4rData.quickReciprocalCount || 0}
                    </div>
                  </div>
                </div>

                {/* Risk Breakdown */}
                {r4rData.scoreBreakdown && (
                  <div className="bg-gray-50 rounded-xl p-6 border">
                    <h4 className="font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Score:</span>
                        <span className="font-medium">{r4rData.scoreBreakdown.cappedBaseScore?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume Multiplier:</span>
                        <span className="font-medium">{r4rData.scoreBreakdown.volumeMultiplier?.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Age Factor:</span>
                        <span className="font-medium">{r4rData.scoreBreakdown.accountAgeMultiplier?.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Penalty:</span>
                        <span className="font-medium">+{r4rData.scoreBreakdown.timePenalty || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!r4rData && !isR4RLoading && !r4rError && (
              <div className="text-center py-8 text-gray-500">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No R4R analysis data available</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
