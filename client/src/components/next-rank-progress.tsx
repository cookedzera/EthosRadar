import { useState, useEffect } from "react";
import { TrendingUp, Crown, Award, Zap, AlertTriangle, Shield, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useWeeklyActivities } from "@/hooks/use-weekly-activities";

interface NextRankProgressProps {
  currentScore: number;
  userkey?: string;
  className?: string;
}

// Official Ethos Protocol tier system (0-2800 range)
const getTierThresholds = () => [
  { 
    threshold: 2800, 
    tier: 'Exemplary (Max)', 
    icon: Crown, 
    colors: 'from-purple-600 to-purple-400', 
    textColor: 'text-purple-300', 
    nextLabel: 'MAX TIER REACHED',
    progressColors: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-500'
  },
  { 
    threshold: 2000, 
    tier: 'Exemplary', 
    icon: Crown, 
    colors: 'from-purple-500 to-purple-300', 
    textColor: 'text-purple-300', 
    nextLabel: 'Exemplary (Max)',
    progressColors: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-500'
  },
  { 
    threshold: 1600, 
    tier: 'Reputable', 
    icon: Award, 
    colors: 'from-emerald-500 to-emerald-300', 
    textColor: 'text-emerald-300', 
    nextLabel: 'Exemplary',
    progressColors: 'from-green-400 to-green-500',
    bgColor: 'bg-green-500'
  },
  { 
    threshold: 1200, 
    tier: 'Neutral', 
    icon: Zap, 
    colors: 'from-blue-500 to-blue-300', 
    textColor: 'text-blue-300', 
    nextLabel: 'Reputable',
    progressColors: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-500'
  },
  { 
    threshold: 800, 
    tier: 'Questionable', 
    icon: AlertTriangle, 
    colors: 'from-amber-500 to-amber-300', 
    textColor: 'text-amber-300', 
    nextLabel: 'Neutral',
    progressColors: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-amber-500'
  },
  { 
    threshold: 0, 
    tier: 'Untrusted', 
    icon: Shield, 
    colors: 'from-gray-500 to-gray-300', 
    textColor: 'text-gray-400', 
    nextLabel: 'Questionable',
    progressColors: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-500'
  }
];

export function NextRankProgress({ currentScore, userkey, className = '' }: NextRankProgressProps) {
  const [progress, setProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Get weekly activities data
  const { data: weeklyData } = useWeeklyActivities(userkey);
  const weeklyScoreChange = weeklyData?.success ? weeklyData.data.summary?.scoreChange || 0 : 0;
  
  const tiers = getTierThresholds();
  const currentTierIndex = tiers.findIndex(tier => currentScore >= tier.threshold);
  const currentTier = tiers[currentTierIndex] || tiers[tiers.length - 1];
  const nextTier = currentTierIndex > 0 ? tiers[currentTierIndex - 1] : null;
  
  // Calculate progress towards next tier
  useEffect(() => {
    if (!nextTier) {
      setProgress(100); // Max tier reached
      return;
    }
    
    const currentTierMin = currentTier.threshold;
    const nextTierMin = nextTier.threshold;
    const scoreInCurrentTier = currentScore - currentTierMin;
    const tierRange = nextTierMin - currentTierMin;
    const calculatedProgress = Math.min(100, (scoreInCurrentTier / tierRange) * 100);
    
    setProgress(calculatedProgress);
  }, [currentScore, currentTier, nextTier]);
  
  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);
  
  if (!nextTier) {
    // Max tier reached
    return (
      <div className={`bg-gray-100/90 rounded-2xl p-4 shadow-md border-0 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Maximum Tier Achieved</div>
            <div className="text-xs text-gray-500">You've reached the highest Ethos Protocol tier</div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="h-3 bg-gray-300/60 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${currentTier.progressColors} rounded-full`} />
          </div>
          <div className="text-center mt-2">
            <span className={`text-lg font-bold ${currentTier.textColor.replace('text-', 'text-').replace('-300', '-500')}`}>100%</span>
          </div>
        </div>
        
        <div className="text-center">
          <span className="text-xs text-purple-500 font-medium">🏆 LEGENDARY STATUS</span>
        </div>
      </div>
    );
  }
  
  const scoreNeeded = nextTier.threshold - currentScore;
  const CurrentIcon = currentTier.icon;
  const NextIcon = nextTier.icon;
  
  return (
    <div className={`bg-gray-100/90 rounded-2xl p-4 shadow-md border-0 ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-purple-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700">NEXT RANK</span>
        </div>
        <span className="text-sm text-green-500 font-medium">
          {scoreNeeded} points needed
        </span>
      </div>

      {/* Weekly Score Change - Only show if there's data */}
      {weeklyScoreChange !== 0 && (
        <div className="flex items-center justify-center mb-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            weeklyScoreChange > 0 
              ? 'bg-green-100 text-green-700' 
              : weeklyScoreChange < 0
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {weeklyScoreChange > 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : weeklyScoreChange < 0 ? (
              <ArrowDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {weeklyScoreChange > 0 ? '+' : ''}{weeklyScoreChange} this week
            </span>
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 bg-gray-300/60 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full bg-gradient-to-r ${currentTier.progressColors} rounded-full relative`}
            initial={{ width: "0%" }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Progress indicator dot */}
            {animatedProgress > 8 && (
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
            )}
          </motion.div>
        </div>
        
        {/* Progress percentage centered */}
        <div className="text-center mt-2">
          <span className={`text-lg font-bold ${currentTier.textColor.replace('text-', 'text-').replace('-300', '-500')}`}>
            {animatedProgress.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Bottom Row - Current and Next Tier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${currentTier.bgColor} flex items-center justify-center`}>
            <CurrentIcon className="w-3 h-3 text-white" />
          </div>
          <div className="text-xs">
            <div className="font-medium text-gray-600">{currentTier.tier}</div>
            <div className="text-gray-500">{currentScore} pts</div>
          </div>
        </div>
        
        <div className="text-gray-400 text-xs">→</div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-right">
            <div className="font-medium text-gray-600">{nextTier.tier}</div>
            <div className="text-gray-500">{nextTier.threshold} pts</div>
          </div>
          <div className={`w-6 h-6 rounded-md ${nextTier.bgColor} flex items-center justify-center`}>
            <NextIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      
      {/* Progress Status */}
      <div className="text-center mt-2">
        <span className={`text-xs ${currentTier.textColor.replace('text-', 'text-').replace('-300', '-500')} font-medium`}>
          Progress: {animatedProgress.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}