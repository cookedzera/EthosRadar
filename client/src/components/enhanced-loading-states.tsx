import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Enhanced skeleton components for better loading experience
export function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#c7c8c9]">
      <div className="max-w-4xl mx-auto px-6 pt-4 pb-12">
        {/* Profile Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded-lg w-48 animate-pulse"></div>
        </div>

        {/* Main Card Skeleton */}
        <div className="w-80 mx-auto bg-gray-100 rounded-3xl p-6 mb-8 shadow-md border-0">
          <div className="flex justify-between items-center mb-3">
            <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
            </div>
          </div>

          {/* Avatar and Info Skeleton */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
            </div>
          </div>

          {/* Score Skeleton */}
          <div className="text-center mb-4">
            <div className="h-12 bg-gray-300 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-20 mx-auto animate-pulse"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="flex justify-between mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-8 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Footer Skeleton */}
          <div className="text-center pt-2 border-t border-gray-300/40">
            <div className="h-3 bg-gray-300 rounded w-20 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="bg-gray-100/90 rounded-2xl p-1 mb-6 shadow-md border-0 max-w-80 mx-auto">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#c7c8c9]">
      <div className="max-w-sm mx-auto px-6 pt-40 pb-28">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-16 bg-gray-300 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-40 mx-auto animate-pulse"></div>
        </div>
        
        {/* Search Card Skeleton */}
        <div className="bg-gray-100 rounded-3xl p-8 mb-10 shadow-md border-0">
          <div className="h-16 bg-gray-300 rounded-3xl w-full animate-pulse"></div>
        </div>
        
        {/* Feature Cards Skeleton */}
        <div className="mt-20 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-3xl p-8 shadow-md border-0">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoreHistoryLoadingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
        <div className="flex items-center gap-4 text-sm">
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-gray-300 rounded animate-pulse mb-3"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-3 bg-gray-300 rounded w-20 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrustMetricsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Next Tier Progress Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-2 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-1 bg-gray-300 rounded-full animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Card Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-300 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-16 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}