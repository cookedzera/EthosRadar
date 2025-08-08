import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Clock, TrendingUp, Users } from 'lucide-react';

interface SearchSuggestionsProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchSuggestionsBelow({ onSearch, className }: SearchSuggestionsProps) {
  const [popularSearches] = useState([
    'vitalik.eth',
    'dwr',
    'jessepollak', 
    'balajis.eth',
    'natehale',
    'farcaster',
    'cookedz'
  ]);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('ethosradar-search-history') || '[]');
      setRecentSearches(recent.slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  return (
    <div className={`mt-8 space-y-6 ${className}`}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card className="p-6 bg-gray-100/60 border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-800">Recent Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                onClick={() => onSearch(search)}
                variant="outline"
                size="sm"
                className="rounded-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 text-xs"
              >
                {search}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Searches */}
      <Card className="p-6 bg-gray-100/60 border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-800">Popular Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search, index) => (
            <Button
              key={index}
              onClick={() => onSearch(search)}
              variant="outline"
              size="sm"
              className="rounded-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700 text-xs hover:border-blue-300"
            >
              {search}
            </Button>
          ))}
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="p-6 bg-gradient-to-r from-purple-100/60 to-blue-100/60 border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-800">Search Tips</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Search by username: <code className="bg-white px-1 rounded text-xs">vitalik</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Search by ENS: <code className="bg-white px-1 rounded text-xs">vitalik.eth</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Search by address: <code className="bg-white px-1 rounded text-xs">0x123...</code></span>
          </div>
        </div>
      </Card>
    </div>
  );
}