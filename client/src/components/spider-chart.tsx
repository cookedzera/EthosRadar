import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

interface SpiderChartProps {
  userkey: string;
  className?: string;
}

interface AnalysisResult {
  [categoryName: string]: number; // Confidence score 0.0 to 1.0
}

interface ProfileAnalysis {
  userkey: string;
  timestamp: string;
  totalReviews: number;
  totalVouches: number;
  avgAuthorScore: number;
  model: string;
  results: AnalysisResult;
}

export function SpiderChart({ userkey, className = '' }: SpiderChartProps) {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Load real analysis from actual API data
  useEffect(() => {
    const loadRealAnalysis = async () => {
      try {
        setLoading(true);
        
        if (!userkey) {
          setError('No user key provided');
          return;
        }

        // Fetch real data from multiple endpoints
        const [reviewsRes, statsRes, vouchActivitiesRes] = await Promise.all([
          fetch(`/api/dashboard-reviews/${encodeURIComponent(userkey)}`),
          fetch(`/api/user-stats/${encodeURIComponent(userkey)}`),
          fetch(`/api/user-vouch-activities/${encodeURIComponent(userkey)}`)
        ]);

        const [reviewsData, statsData, vouchData] = await Promise.all([
          reviewsRes.ok ? reviewsRes.json() : null,
          statsRes.ok ? statsRes.json() : null,
          vouchActivitiesRes.ok ? vouchActivitiesRes.json() : null
        ]);

        // Calculate real metrics from actual data
        const reviews = reviewsData?.success ? reviewsData.data || [] : [];
        const stats = statsData?.success ? statsData.data : null;
        const vouches = vouchData?.success ? vouchData.data || [] : [];
        
        const totalReviews = reviews.length;
        const totalVouches = vouches.length;
        const positiveReviews = reviews.filter((r: any) => r.score > 0).length;
        const avgAuthorScore = reviews.length > 0 
          ? Math.round(reviews.reduce((sum: number, r: any) => sum + (r.authorScore || 0), 0) / reviews.length)
          : 0;

        // Generate analysis based on real data patterns
        const analysisResults: AnalysisResult = {};

        // Trust metrics based on actual review scores and patterns
        if (totalReviews > 0) {
          const positiveRatio = positiveReviews / totalReviews;
          const highScoreReviews = reviews.filter((r: any) => r.score >= 3).length;
          const consistentRating = highScoreReviews / totalReviews;
          
          analysisResults["Trustworthy"] = Math.min(0.95, positiveRatio * 0.8 + (totalReviews / 20) * 0.2);
          analysisResults["Reliable"] = Math.min(0.95, consistentRating * 0.9 + (avgAuthorScore / 3000) * 0.1);
          analysisResults["Professional"] = Math.min(0.90, (avgAuthorScore / 3000) * 0.7 + consistentRating * 0.3);
        } else {
          // Default values for new users
          analysisResults["Trustworthy"] = 0.20;
          analysisResults["Reliable"] = 0.15;
          analysisResults["Professional"] = 0.25;
        }

        // Vouch-based metrics
        if (totalVouches > 0) {
          const vouchScore = Math.min(0.90, (totalVouches / 10) * 0.8 + 0.2);
          analysisResults["Collaborative"] = vouchScore;
          analysisResults["Network Builder"] = Math.min(0.85, vouchScore * 0.9);
        } else {
          analysisResults["Collaborative"] = 0.10;
          analysisResults["Network Builder"] = 0.05;
        }

        // Activity-based metrics
        const hasRecentActivity = reviews.some((r: any) => 
          new Date(r.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        );
        
        analysisResults["Active"] = hasRecentActivity ? 
          Math.min(0.80, (totalReviews / 15) * 0.6 + 0.4) : 
          Math.max(0.05, (totalReviews / 20) * 0.5);

        // Quality metrics based on review content patterns (simplified)
        const hasDescriptiveReviews = reviews.some((r: any) => 
          r.comment && r.comment.length > 50
        );
        
        if (hasDescriptiveReviews) {
          analysisResults["Helpful"] = Math.min(0.85, positiveRatio * 0.7 + 0.3);
          analysisResults["Knowledgeable"] = Math.min(0.80, (avgAuthorScore / 3000) * 0.8 + 0.2);
        } else {
          analysisResults["Helpful"] = Math.max(0.10, positiveRatio * 0.5);
          analysisResults["Knowledgeable"] = Math.max(0.15, (avgAuthorScore / 3000) * 0.6);
        }

        setAnalysis({
          userkey,
          timestamp: new Date().toISOString(),
          totalReviews,
          totalVouches,
          avgAuthorScore,
          model: "real-data-analysis",
          results: analysisResults
        });

      } catch (err) {
        console.error('Failed to load real analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    if (userkey) {
      loadRealAnalysis();
    }
  }, [userkey]);

  // Create chart when analysis changes
  useEffect(() => {
    if (!analysis || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter out categories with very low values for cleaner display
    const filteredCategories = Object.keys(analysis.results)
      .filter(category => analysis.results[category] > 0.2)
      .slice(0, 8); // Limit to 8 categories for readability
    
    const data = filteredCategories.map(category => 
      Math.round(analysis.results[category] * 100)
    );

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels: filteredCategories,
        datasets: [{
          label: 'Profile Analysis',
          data: data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.15)', // blue with opacity
          borderColor: 'rgb(59, 130, 246)', // blue-500
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 2
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true,
              color: '#e5e7eb' // gray-200
            },
            grid: {
              color: '#e5e7eb' // gray-200
            },
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 11
              },
              color: '#4b5563' // gray-600
            },
            ticks: {
              display: true,
              stepSize: 25,
              color: '#9ca3af', // gray-400
              backdropColor: 'transparent'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937', // gray-800
            titleColor: '#f9fafb', // gray-50
            bodyColor: '#e5e7eb', // gray-200
            borderColor: '#374151', // gray-700
            borderWidth: 1,
            callbacks: {
              label: function(context: any) {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analysis]);

  const getTopCategories = () => {
    if (!analysis) return [];
    
    return Object.keys(analysis.results)
      .filter(category => analysis.results[category] > 0.2)
      .sort((a, b) => analysis.results[b] - analysis.results[a])
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className={`bg-gray-100/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border-0 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Profile Analysis</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-100/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border-0 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-lg">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Analysis Error</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const topCategories = getTopCategories();

  return (
    <div className={`bg-gray-100/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border-0 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Profile Analysis</h3>
      </div>

      {/* Spider Chart */}
      <div className="mb-6 bg-white/60 rounded-2xl p-6">
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Top Matches */}
      {topCategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🌟 Top Matches</h4>
          {topCategories.map((category, index) => {
            const score = analysis!.results[category];
            const percentage = Math.round(score * 100);
            const rankEmoji = ['🥇', '🥈', '🥉'][index];

            return (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-200/60 rounded-2xl border-0 hover:bg-gray-200/80 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{rankEmoji}</span>
                  <div>
                    <div className="font-medium text-gray-900">{category}</div>
                    <div className="text-sm text-gray-600">Confidence: {score.toFixed(3)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}