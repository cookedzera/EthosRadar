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

  // Mock analysis for now - replace with actual API call
  useEffect(() => {
    const mockAnalysis = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call to your backend
        const mockResults: AnalysisResult = {
          "Trustworthy": 0.85,
          "Professional": 0.72,
          "Helpful": 0.68,
          "Reliable": 0.91,
          "Knowledgeable": 0.76,
          "Responsive": 0.63,
          "Innovative": 0.45,
          "Collaborative": 0.82
        };

        setAnalysis({
          userkey,
          timestamp: new Date().toISOString(),
          totalReviews: 12,
          totalVouches: 8,
          avgAuthorScore: 1250,
          model: "gpt-4",
          results: mockResults
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    if (userkey) {
      mockAnalysis();
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