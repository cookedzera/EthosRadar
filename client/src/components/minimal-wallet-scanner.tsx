import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Suggestion {
  userkey: string;
  username: string;
  display_name: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
  fid?: number;
}

interface MinimalWalletScannerProps {
  onUserFound?: (user: any, mode: 'farcaster' | 'global') => void;
}

export function MinimalWalletScanner({ onUserFound }: MinimalWalletScannerProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Search suggestions
  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ['/api/search-suggestions', query],
    queryFn: async () => {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    },
    enabled: query.length >= 2 && showSuggestions,
    staleTime: 30000,
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch(`/api/search/${encodeURIComponent(searchQuery)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data && onUserFound) {
        onUserFound(data, 'global');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/search-suggestions'] });
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.username);
    setShowSuggestions(false);
    searchMutation.mutate(suggestion.username);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-sm mx-auto relative">
      {/* Minimal search input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter wallet address or ENS"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full h-12 pl-4 pr-20 text-base border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searchMutation.isPending}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
        >
          {searchMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Search suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.slice(0, 5).map((suggestion: Suggestion) => (
            <button
              key={suggestion.userkey}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              {suggestion.pfp_url ? (
                <img
                  src={suggestion.pfp_url}
                  alt={suggestion.display_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {suggestion.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.display_name || suggestion.username}
                </p>
                <p className="text-xs text-gray-500 truncate">@{suggestion.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Quick examples */}
      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-400 text-center">Try these examples:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['vitalik.eth', 'dwr.eth', 'jessepollak'].map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example);
                searchMutation.mutate(example);
              }}
              className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}