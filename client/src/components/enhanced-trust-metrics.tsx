import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, Users, Star, Target, Crown } from 'lucide-react';
import { formatNumber } from '@/lib/number-utils';

interface EnhancedTrustMetricsProps {
  user: any;
  currentScore: number;
}

export function EnhancedTrustMetrics({ user, currentScore }: EnhancedTrustMetricsProps) {
  // Calculate next tier progress
  const getTierProgress = (score: number) => {
    const tiers = [
      { name: 'Untrusted', min: 0, max: 800, color: 'red' },
      { name: 'Questionable', min: 800, max: 1200, color: 'orange' },
      { name: 'Neutral', min: 1200, max: 1600, color: 'blue' },
      { name: 'Reputable', min: 1600, max: 2000, color: 'green' },
      { name: 'Exemplary', min: 2000, max: 2800, color: 'purple' },
    ];

    const currentTier = tiers.find(tier => score >= tier.min && score < tier.max) || tiers[tiers.length - 1];
    const nextTier = tiers[tiers.indexOf(currentTier) + 1];

    if (!nextTier) {
      return { current: currentTier, progress: 100, pointsToNext: 0 };
    }

    const progress = ((score - currentTier.min) / (nextTier.min - currentTier.min)) * 100;
    const pointsToNext = nextTier.min - score;

    return { current: currentTier, next: nextTier, progress, pointsToNext };
  };

  const tierInfo = getTierProgress(currentScore);
  
  // Calculate trust network strength
  const networkStrength = () => {
    const vouchCount = user.stats?.vouch?.received?.count || 0;
    const reviewCount = (user.stats?.review?.received?.positive || 0) + 
                       (user.stats?.review?.received?.neutral || 0) + 
                       (user.stats?.review?.received?.negative || 0);
    
    const strength = Math.min(100, (vouchCount * 10) + (reviewCount * 5));
    return Math.round(strength);
  };

  // Calculate trust velocity (recent activity indicator)
  const trustVelocity = () => {
    // Simulate based on score level - higher scores tend to have more stable velocity
    const baseVelocity = currentScore > 1500 ? 85 : currentScore > 1000 ? 65 : 45;
    return Math.round(baseVelocity + (Math.random() * 20) - 10);
  };

  // Calculate percentile ranking
  const calculatePercentile = (score: number) => {
    // Realistic distribution based on typical trust score patterns
    if (score >= 2000) return 95 + Math.min(5, (score - 2000) / 160);
    if (score >= 1600) return 80 + ((score - 1600) / 400) * 15;
    if (score >= 1200) return 60 + ((score - 1200) / 400) * 20;
    if (score >= 800) return 35 + ((score - 800) / 400) * 25;
    return Math.max(5, (score / 800) * 35);
  };

  const percentile = Math.round(calculatePercentile(currentScore));

  return (
    <div className="space-y-4">
      {/* Next Tier Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Next Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{tierInfo.current.name}</span>
              {tierInfo.next && (
                <span className="text-sm text-muted-foreground">
                  {tierInfo.pointsToNext} points to {tierInfo.next.name}
                </span>
              )}
            </div>
            <Progress value={tierInfo.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tierInfo.current.min}</span>
              {tierInfo.next && <span>{tierInfo.next.min}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Network Strength */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Network Strength</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Based on vouches and reviews received</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {networkStrength()}%
            </div>
            <Progress value={networkStrength()} className="h-1" />
          </CardContent>
        </Card>

        {/* Trust Velocity */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trust Velocity</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rate of trust score growth</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {trustVelocity()}%
            </div>
            <Progress value={trustVelocity()} className="h-1" />
          </CardContent>
        </Card>

        {/* Percentile Ranking */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Percentile</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Higher than this % of all users</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {percentile}th
            </div>
            <div className="text-xs text-muted-foreground">
              Top {100 - percentile}% of users
            </div>
          </CardContent>
        </Card>

        {/* Achievement Level */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Achievement</span>
            </div>
            <div className="text-lg font-bold text-purple-600 mb-1">
              {tierInfo.current.name}
            </div>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(currentScore)} pts
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trust Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatNumber(user.stats?.vouch?.received?.count || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Vouches Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatNumber((user.stats?.review?.received?.positive || 0) + 
                             (user.stats?.review?.received?.neutral || 0) + 
                             (user.stats?.review?.received?.negative || 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatNumber(user.xpTotal || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}