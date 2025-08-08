import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { SiFarcaster } from 'react-icons/si';
import { LazyImage } from '@/components/lazy-image';
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
  const [farcasterMode, setFarcasterMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Enhanced search suggestions with search history
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ethosradar-search-history') || '[]');
    } catch {
      return [];
    }
  });

  // Smart search suggestions combining API results and local history
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ['/api/search-suggestions', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      // Detect search type automatically
      const searchType = detectSearchType(query);
      
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}&type=${searchType}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        
        // Combine API suggestions with relevant search history
        const historySuggestions = searchHistory
          .filter(h => h.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(h => ({ userkey: h, username: h, display_name: h, isHistory: true }));
        
        return [...data, ...historySuggestions];
      } catch (error) {
        // Fallback to search history only if API fails
        return searchHistory
          .filter(h => h.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map(h => ({ userkey: h, username: h, display_name: h, isHistory: true }));
      }
    },
    enabled: query.length >= 1,
    staleTime: 30000,
  });

  // Smart search type detection
  const detectSearchType = (input: string) => {
    if (input.startsWith('0x') && input.length === 42) return 'address';
    if (input.endsWith('.eth')) return 'ens';
    if (input.includes('@') || input.match(/^[a-zA-Z0-9_]+$/)) return 'username';
    return 'general';
  };

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      if (farcasterMode) {
        const response = await fetch('/api/search-user-farcaster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farcasterUsername: searchQuery })
        });
        if (!response.ok) throw new Error('Farcaster search failed');
        return await response.json();
      } else {
        const response = await fetch(`/api/search/${encodeURIComponent(searchQuery)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
      }
    },
    onSuccess: (data) => {
      console.log('Search result received:', data);
      if (data && data.success && data.data && onUserFound) {
        console.log('New user found:', data.data.displayName, 'Userkey:', data.data.userkeys?.[0]);
        
        // Clear all caches completely to force fresh data
        queryClient.clear();
        
        // Call onUserFound with the appropriate mode
        const mode = farcasterMode ? 'farcaster' : 'global';
        onUserFound(data.data, mode);
      } else if (data && !data.success) {
        console.error('Search failed:', data.error);
      }
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      // Add to search history
      const newHistory = [query.trim(), ...searchHistory.filter(h => h !== query.trim())].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('ethosradar-search-history', JSON.stringify(newHistory));
      
      searchMutation.mutate(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const searchTerm = suggestion.display_name || suggestion.username;
    setQuery(searchTerm);
    setShowSuggestions(false);
    
    // Add to search history
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('ethosradar-search-history', JSON.stringify(newHistory));
    
    // Use the userkey for accurate search
    searchMutation.mutate(suggestion.userkey);
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
    console.log('Input changed:', value, 'Show suggestions:', value.length >= 2);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
    console.log('Input focused, query length:', query.length, 'Will show suggestions:', query.length >= 2);
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

  const toggleFarcasterMode = () => {
    const newMode = !farcasterMode;
    setFarcasterMode(newMode);
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative">
      {/* Farcaster Mode Toggle */}
      <div className="flex justify-center mb-4">
        <Button
          onClick={toggleFarcasterMode}
          variant={farcasterMode ? "default" : "outline"}
          size="sm"
          className={`
            rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
            ${farcasterMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
              : 'bg-white hover:bg-purple-50 text-purple-600 border-purple-200'
            }
          `}
        >
          <SiFarcaster className="w-4 h-4 mr-2" />
          {farcasterMode ? 'Farcaster Mode' : 'Enable Farcaster'}
        </Button>
      </div>

      {/* Clean search input - no background, just border */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={farcasterMode ? "Enter Farcaster username..." : "Enter wallet address or ENS"}
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full h-16 pl-5 pr-20 text-base border-0 rounded-3xl bg-white text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none transition-all shadow-md"
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
      {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto border-0">
          {suggestionsLoading ? (
            <div className="px-4 py-3 text-gray-500 text-sm">Loading suggestions...</div>
          ) : (
            suggestions.slice(0, 5).map((suggestion: Suggestion) => (
              <button
                key={suggestion.userkey}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {suggestion.pfp_url ? (
                    <img
                      src={suggestion.pfp_url}
                      alt={suggestion.display_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar failed to load:', suggestion.pfp_url);
                        // Hide the broken image and show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        // Hide fallback when image loads successfully
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-xs text-gray-500 font-medium w-full h-full flex items-center justify-center"
                    style={{ display: suggestion.pfp_url ? 'none' : 'flex' }}
                  >
                    {suggestion.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.display_name || suggestion.username}
                    </p>
                    {(suggestion as any).isHistory && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                        Recent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {(suggestion as any).isHistory ? 'Search history' : `@${suggestion.username}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}