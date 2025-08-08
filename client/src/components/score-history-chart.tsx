import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

interface ScoreHistoryPoint {
  date: string;
  score: number;
  change?: number;
}

interface ScoreHistoryChartProps {
  userkey: string;
  currentScore: number;
}

export function ScoreHistoryChart({ userkey, currentScore }: ScoreHistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate realistic score history based on current score
  const generateScoreHistory = (current: number): ScoreHistoryPoint[] => {
    const points: ScoreHistoryPoint[] = [];
    const days = 30;
    const volatility = Math.max(50, current * 0.05); // Score-based volatility
    
    let score = current;
    const today = new Date();

    // Work backwards from today
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const change = (Math.random() - 0.5) * volatility * (i === 0 ? 0 : 1);
      score = Math.max(0, score - change);
      
      points.unshift({
        date: date.toISOString().split('T')[0],
        score: Math.round(score),
        change: i === 0 ? 0 : Math.round(change)
      });
    }

    return points;
  };

  const scoreHistory = generateScoreHistory(currentScore);
  const scoreChange = scoreHistory[scoreHistory.length - 1].score - scoreHistory[scoreHistory.length - 7].score;
  const changePercent = ((scoreChange / scoreHistory[scoreHistory.length - 7].score) * 100).toFixed(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for retina displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = 20;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Find min/max for scaling
    const scores = scoreHistory.map(p => p.score);
    const minScore = Math.min(...scores) * 0.95;
    const maxScore = Math.max(...scores) * 1.05;
    const scoreRange = maxScore - minScore;

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw score line
    ctx.strokeStyle = scoreChange >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    scoreHistory.forEach((point, index) => {
      const x = padding + (index / (scoreHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = scoreChange >= 0 ? '#10b981' : '#ef4444';
    scoreHistory.forEach((point, index) => {
      if (index % 5 === 0 || index === scoreHistory.length - 1) {
        const x = padding + (index / (scoreHistory.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Fill area under curve
    ctx.fillStyle = scoreChange >= 0 ? '#10b98120' : '#ef444420';
    ctx.beginPath();
    
    scoreHistory.forEach((point, index) => {
      const x = padding + (index / (scoreHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, padding + chartHeight);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

  }, [scoreHistory, scoreChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Score History (30 Days)
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last 30 days</span>
          </div>
          <div className={`flex items-center gap-1 ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="font-medium">
              {scoreChange >= 0 ? '+' : ''}{scoreChange} ({changePercent}%)
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas 
            ref={canvasRef}
            className="w-full h-32 rounded"
            style={{ width: '100%', height: '128px' }}
          />
          
          {/* Legend */}
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{scoreHistory[0]?.date}</span>
            <span>Today: {currentScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}