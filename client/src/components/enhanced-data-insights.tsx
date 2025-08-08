import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Network, 
  Clock, 
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  data?: any;
}

interface EnhancedDataInsightsProps {
  user: any;
  userkey: string;
  scoreHistory?: any[];
  r4rData?: any;
}

export function EnhancedDataInsights({ user, userkey, scoreHistory, r4rData }: EnhancedDataInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate intelligent insights based on user data
  const generateInsights = (): DataInsight[] => {
    const insights: DataInsight[] = [];
    const currentScore = user.score || 0;

    // Score trend analysis
    if (scoreHistory && scoreHistory.length > 1) {
      const recentScore = scoreHistory[scoreHistory.length - 1]?.score || 0;
      const previousScore = scoreHistory[scoreHistory.length - 2]?.score || 0;
      const trend = recentScore - previousScore;

      if (Math.abs(trend) > 50) {
        insights.push({
          id: 'score_trend',
          type: trend > 0 ? 'achievement' : 'anomaly',
          title: trend > 0 ? 'Positive Score Momentum' : 'Score Decline Alert',
          description: `Trust score ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend)} points recently`,
          impact: Math.abs(trend) > 100 ? 'high' : 'medium',
          confidence: 95,
          actionable: trend < 0,
          data: { trend, recentScore, previousScore }
        });
      }
    }

    // Activity patterns
    const vouchCount = user.stats?.vouch?.received?.count || 0;
    const reviewCount = (user.stats?.review?.received?.positive || 0) + 
                       (user.stats?.review?.received?.neutral || 0) + 
                       (user.stats?.review?.received?.negative || 0);

    if (vouchCount > 0 && reviewCount === 0) {
      insights.push({
        id: 'review_opportunity',
        type: 'opportunity',
        title: 'Review Activity Opportunity',
        description: 'You have vouches but no reviews. Engaging in peer reviews could boost your trust score',
        impact: 'medium',
        confidence: 80,
        actionable: true,
        data: { vouchCount, reviewCount }
      });
    }

    // Tier progression analysis
    const tierThresholds = [800, 1200, 1600, 2000, 2800];
    const currentTierIndex = tierThresholds.findIndex(threshold => currentScore < threshold);
    const nextThreshold = currentTierIndex >= 0 ? tierThresholds[currentTierIndex] : null;

    if (nextThreshold && (nextThreshold - currentScore) <= 200) {
      insights.push({
        id: 'tier_proximity',
        type: 'opportunity',
        title: 'Next Tier Within Reach',
        description: `You're only ${nextThreshold - currentScore} points away from the next tier`,
        impact: 'high',
        confidence: 100,
        actionable: true,
        data: { currentScore, nextThreshold, gap: nextThreshold - currentScore }
      });
    }

    // R4R analysis insights
    if (r4rData?.r4rScore !== undefined) {
      if (r4rData.r4rScore > 0.3) {
        insights.push({
          id: 'r4r_warning',
          type: 'anomaly',
          title: 'Reciprocal Activity Detected',
          description: 'High reciprocal review patterns detected. Consider diversifying your review network',
          impact: 'medium',
          confidence: 85,
          actionable: true,
          data: { r4rScore: r4rData.r4rScore }
        });
      }
    }

    // Network strength insights
    const networkStrength = calculateNetworkStrength(user);
    if (networkStrength < 30 && currentScore > 1000) {
      insights.push({
        id: 'network_weak',
        type: 'opportunity',
        title: 'Network Expansion Opportunity',
        description: 'Your trust score is strong but network connections are limited. Building more connections could enhance credibility',
        impact: 'medium',
        confidence: 75,
        actionable: true,
        data: { networkStrength, currentScore }
      });
    }

    return insights.sort((a, b) => {
      // Sort by impact (high first) then confidence
      const impactScore = { high: 3, medium: 2, low: 1 };
      if (impactScore[a.impact] !== impactScore[b.impact]) {
        return impactScore[b.impact] - impactScore[a.impact];
      }
      return b.confidence - a.confidence;
    });
  };

  const calculateNetworkStrength = (user: any): number => {
    const vouchCount = user.stats?.vouch?.received?.count || 0;
    const reviewCount = (user.stats?.review?.received?.positive || 0) + 
                       (user.stats?.review?.received?.neutral || 0) + 
                       (user.stats?.review?.received?.negative || 0);
    
    return Math.min(100, (vouchCount * 8) + (reviewCount * 3) + ((user.score || 0) / 2500) * 20);
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string, impact: string) => {
    switch (type) {
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'opportunity':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700'
    };
    return <Badge className={`text-xs ${variants[impact as keyof typeof variants]}`}>{impact}</Badge>;
  };

  const handleRefreshInsights = async () => {
    setIsAnalyzing(true);
    // Simulate analysis time
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Smart Insights
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshInsights}
            disabled={isAnalyzing}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {insights.length} insights found • AI-powered analysis
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No specific insights detected</p>
            <p className="text-xs">Your profile looks consistent</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type, insight.impact)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    {getImpactBadge(insight.impact)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {insight.confidence}% confidence
                    </div>
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats Summary */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Network className="h-4 w-4" />
            Profile Health Score
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(calculateNetworkStrength(user))}%
              </div>
              <div className="text-xs text-muted-foreground">Network</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {insights.filter(i => i.type === 'achievement').length}
              </div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-xs text-muted-foreground">Actions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}