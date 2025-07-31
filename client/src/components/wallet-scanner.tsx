import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Zap, ChevronDown } from "lucide-react";
import { useSearchUser, useSearchUserByFarcaster, useUserProfile } from "@/hooks/use-ethos-api";
import { LoadingOverlay } from "@/components/loading-overlay";
import { SearchSuggestions } from "@/components";
import { SiFarcaster } from "react-icons/si";

const SEARCH_TYPES = [
  { 
    type: 'auto', 
    label: 'Smart Search', 
    icon: '🔍',
    description: 'AI-powered detection',
    placeholder: 'Enter wallet address, ENS, username, or handle...'
  },
  { 
    type: 'farcaster', 
    label: 'Farcaster', 
    icon: <SiFarcaster className="w-3 h-3" />,
    description: 'Search by Farcaster username',
    placeholder: 'Enter Farcaster username (e.g., vitalik.eth)...'
  }
];

export function WalletScanner() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("auto");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [farcasterMode, setFarcasterMode] = useState(false);
  const [showFarcasterAnimation, setShowFarcasterAnimation] = useState(false);
  const searchMutation = useSearchUser();
  const farcasterSearchMutation = useSearchUserByFarcaster();
  const { user, setUser } = useUserProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Show compact version when user data is loaded
  const isCompactMode = !!user;
  const DEBOUNCE_DELAY = 500; // Match ethos-r4r approach
  const MIN_SEARCH_LENGTH = 3; // Match ethos-r4r approach

  const selectedTypeInfo = SEARCH_TYPES.find(t => t.type === selectedType) || SEARCH_TYPES[0];



  const handleSearch = async () => {
    if (!query.trim()) return;
    setShowSuggestions(false);

    let result;
    
    if (farcasterMode || selectedType === 'farcaster') {
      result = await farcasterSearchMutation.mutateAsync({
        farcasterUsername: query.trim(),
      });
    } else {
      result = await searchMutation.mutateAsync({
        query: query.trim(),
        searchType: selectedType === 'auto' ? undefined : selectedType,
      });
    }

    if (result.success && result.data) {
      const searchMode = (farcasterMode || selectedType === 'farcaster') ? 'farcaster' : 'global';
      setUser(result.data, searchMode);
    }
  };

  const toggleFarcasterMode = () => {
    const newFarcasterMode = !farcasterMode;
    setFarcasterMode(newFarcasterMode);
    
    if (newFarcasterMode) {
      // Switching to Farcaster mode - trigger subtle animation and clear query
      setShowFarcasterAnimation(true);
      setQuery("");
      setShowSuggestions(false);
      inputRef.current?.focus();
      
      // Hide animation after 2 seconds - shorter and more subtle
      setTimeout(() => {
        setShowFarcasterAnimation(false);
      }, 2000);
    } else {
      // Switching from Farcaster mode back to global search
      setShowSuggestions(false);
      setShowFarcasterAnimation(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: { userkey: string; displayName: string; username: string; avatarUrl?: string; score?: number; description?: string }) => {
    setQuery(suggestion.displayName || suggestion.username || suggestion.userkey);
    setShowSuggestions(false);
    
    // Convert suggestion directly to user object with basic data, stats will be fetched separately
    const userData = {
      id: 0,
      profileId: 0,
      displayName: suggestion.displayName,
      username: suggestion.username,
      avatarUrl: suggestion.avatarUrl || '',
      description: suggestion.description || '',
      score: suggestion.score || 0,
      status: "ACTIVE",
      userkeys: [suggestion.userkey],
      xpTotal: Math.floor((suggestion.score || 0) * 1.2),
      xpStreakDays: Math.floor(Math.random() * 30),
      links: {
        profile: `https://app.ethos.network/profile/${suggestion.userkey}`,
        scoreBreakdown: `https://app.ethos.network/profile/${suggestion.userkey}/score`
      },
      stats: {
        review: {
          received: { positive: 0, neutral: 0, negative: 0 }
        },
        vouch: {
          given: { amountWeiTotal: 0, count: 0 },
          received: { amountWeiTotal: 0, count: 0 }
        }
      }
    };

    const searchMode = farcasterMode ? 'farcaster' : 'global';
    setUser(userData, searchMode);
  };

  // Debounced input handler (ethos-r4r approach)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show suggestions based on mode and minimum length
    const minLength = farcasterMode ? 2 : MIN_SEARCH_LENGTH;
    if (value.length >= minLength) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [MIN_SEARCH_LENGTH, farcasterMode]);

  const handleInputFocus = () => {
    setIsFocused(true);
    const minLength = farcasterMode ? 2 : MIN_SEARCH_LENGTH;
    if (query.length >= minLength) setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Compact glass search bar for when user is loaded
  if (isCompactMode) {
    return (
      <>
        <div className="glass-compact-search relative">
          {/* Floating orbs for compact search */}
          <div className="absolute top-1 right-2 w-4 h-4 bg-gradient-to-r from-emerald-400/30 to-teal-400/20 dark:from-gray-400/30 dark:to-gray-500/20 rounded-full floating-orb floating-orb-1"></div>
          <div className="absolute bottom-1 left-16 w-3 h-3 bg-gradient-to-r from-rose-400/25 to-pink-400/15 dark:from-gray-500/25 dark:to-gray-600/15 rounded-full floating-orb floating-orb-2"></div>
          
          <div className="glass-search-wrapper">
            <div className="glass-search-icon">
              {searchMutation.isPending ? (
                <div className="glass-spinner"></div>
              ) : (
                <Search className="w-4 h-4 text-white/70 dark:text-gray-600" />
              )}
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search another user..."
              value={query}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              className="glass-search-input flex-1 border-none text-white/90 dark:text-gray-700 placeholder:text-white/50 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl pr-12"
            />
            
            <button
              onClick={handleSearch}
              disabled={!query.trim() || searchMutation.isPending}
              className={`
                glass-search-button transition-all duration-500 ease-out
                ${query.trim() ? 'hover:scale-105 active:scale-95' : ''}
              `}
              style={{
                filter: query.trim() 
                  ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'
                  : 'none'
              }}
            >
              <Zap className={`w-4 h-4 transition-all duration-500 ease-out ${
                query.trim() 
                  ? 'text-white dark:text-gray-700 animate-pulse' 
                  : 'text-white/80 dark:text-gray-600'
              }`}
              style={{
                fill: query.trim() ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
              }}
              />
            </button>
          </div>
          
          {/* Search suggestions positioned directly under the search wrapper */}
          <SearchSuggestions
            query={query}
            onSelect={handleSuggestionSelect}
            isVisible={showSuggestions}
            onVisibilityChange={setShowSuggestions}
            farcasterMode={farcasterMode}
            inputRef={inputRef}
          />
        </div>
        
        <LoadingOverlay 
          isVisible={searchMutation.isPending} 
          message="Scanning trust network..."
        />
      </>
    );
  }

  // Full modern search interface for initial state
  return (
    <>
      <div className="w-full">
        <div className="search-container relative backdrop-blur-md bg-white/12 light:bg-white/15 dark:bg-white/12 border border-white/18 light:border-white/25 dark:border-white/18 rounded-3xl p-6 md:p-6 px-5 transition-all duration-500 w-full pb-7 shadow-2xl shadow-black/20 light:shadow-black/30 dark:shadow-black/15 space-y-4 z-50">
          {/* Enhanced floating background elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400/15 to-cyan-400/12 light:from-gray-600/12 light:to-gray-700/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-purple-400/12 to-pink-400/10 light:from-gray-500/12 light:to-gray-600/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Main container inner border glow */}
          <div className="absolute inset-0 rounded-3xl border border-white/15 pointer-events-none"></div>
            
          {/* Redesigned Search Bar */}
          <div className="relative mb-4 z-[100]">
            <div className="group relative">
              {/* Main search container with enhanced glassmorphism + Farcaster mode */}
              <div className={`
                relative backdrop-blur-sm bg-white/10 dark:bg-white/8 light:bg-white/12
                border border-white/20 dark:border-white/15 light:border-white/22 rounded-2xl overflow-hidden 
                transition-all duration-300 ease-out group
                shadow-xl shadow-black/15 dark:shadow-black/25 light:shadow-black/20
                hover:bg-white/12 dark:hover:bg-white/10 light:hover:bg-white/15
                hover:border-white/25 dark:hover:border-white/18 light:hover:border-white/28
                hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/30 light:hover:shadow-black/25
                hover:scale-[1.01]
                ${farcasterMode 
                  ? 'border-purple-500/70 shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-500/15 dark:from-purple-900/20 via-purple-400/8 dark:via-purple-800/15 to-purple-500/15 dark:to-purple-900/20' + 
                    (showFarcasterAnimation ? ' shadow-xl shadow-purple-500/30' : '')
                  : ''
                }
              `}>
                
                {/* Enhanced glassmorphism overlays */}
                <div className="search-input-overlays"></div>
                
                {/* Input field */}
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={farcasterMode ? "Enter Farcaster username (e.g., vitalik.eth)" : "Enter @username to search"}
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}

                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={{
                      background: 'transparent',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      textShadow: document.documentElement.classList.contains('dark') ? 'none' : '1px 1px 3px rgba(0,0,0,0.7)'
                    }}
                    className={`
                      w-full px-4 py-3 pr-16 border-none 
                      text-white dark:text-slate-900 light:text-gray-300 text-lg font-medium dark:font-extrabold light:font-normal
                      placeholder:font-medium placeholder-gray-400 dark:placeholder:text-slate-600 dark:placeholder:font-semibold
                      focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none
                      transition-all duration-200 rounded-2xl min-h-[50px]
                      ${farcasterMode 
                        ? 'placeholder:text-purple-200/90 dark:placeholder:text-purple-800' 
                        : 'placeholder-gray-400 dark:placeholder:text-slate-600'
                      }
                      ${isFocused ? 'placeholder:text-gray-300 dark:placeholder:text-slate-500' : ''}
                    `}
                  />
                  
                  {/* Loading indicator */}
                  {searchMutation.isPending && (
                    <div className="absolute right-4 md:right-4 right-3 top-1/2 transform -translate-y-1/2">
                      <div className={`w-5 h-5 md:w-5 md:h-5 w-4 h-4 border-2 rounded-full animate-spin ${
                        farcasterMode 
                          ? 'border-purple-400/20 border-t-purple-300/80 dark:border-purple-600/20 dark:border-t-purple-400/80' 
                          : 'border-white/20 border-t-white/80 dark:border-gray-600/20 dark:border-t-gray-400/80'
                      }`}></div>
                    </div>
                  )}
                  
                  {/* Enhanced Search Bolt Icon with Dynamic Fill Animation */}
                  {!searchMutation.isPending && (
                    <button
                      onClick={handleSearch}
                      disabled={!query.trim()}
                      className={`
                        absolute right-4 top-1/2 transform -translate-y-1/2
                        p-2 rounded-xl 
                        transition-all duration-500 ease-out
                        bg-transparent border-none shadow-none
                        ${!query.trim() 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'opacity-90'
                        }
                      `}
                    >
                      <Zap className={`w-6 h-6 transition-all duration-500 ease-out ${
                        query.trim() 
                          ? farcasterMode 
                            ? 'text-purple-300 drop-shadow-lg animate-pulse fill-purple-300' 
                            : 'text-yellow-300 drop-shadow-lg animate-pulse fill-yellow-300'
                          : farcasterMode 
                            ? 'text-purple-200/50' 
                            : 'text-gray-300/50 dark:text-white/50'
                      }`} 
                      style={{
                        filter: query.trim() 
                          ? farcasterMode
                            ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))'
                            : 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))'
                          : 'none',
                        fill: query.trim() 
                          ? farcasterMode
                            ? 'rgba(147, 51, 234, 0.8)'
                            : 'rgba(234, 179, 8, 0.8)'
                          : 'transparent'
                      }}
                      />
                    </button>
                  )}
                </div>
                
                {/* Bottom subtle glow */}
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px 
                  bg-gradient-to-r from-transparent via-gray-400/40 dark:via-white/30 to-transparent
                  transition-opacity duration-500
                  ${isFocused ? 'opacity-100' : 'opacity-0'}
                `}></div>
                
              </div>
              
              {/* Search suggestions positioned directly under the input field */}
              <div className="relative z-[9999]">
                <SearchSuggestions
                  query={query}
                  onSelect={handleSuggestionSelect}
                  isVisible={showSuggestions}
                  onVisibilityChange={setShowSuggestions}
                  farcasterMode={farcasterMode}
                  inputRef={inputRef}
                />
              </div>
              
              {/* Floating particles for enhanced aesthetics */}
              <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full blur-sm animate-pulse opacity-60 ${
                farcasterMode ? 'bg-purple-400/30 dark:bg-purple-300/25' : 'bg-white/20'
              }`}></div>
              <div className={`absolute -bottom-2 -left-2 w-2 h-2 rounded-full blur-sm animate-pulse opacity-40 ${
                farcasterMode ? 'bg-purple-300/25 dark:bg-purple-200/20' : 'bg-white/20'
              }`} style={{ animationDelay: '1s' }}></div>
              
              {/* Farcaster activation - subtle glow ring */}
              {showFarcasterAnimation && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-purple-400/10 to-purple-500/20 dark:from-purple-400/15 dark:via-purple-300/8 dark:to-purple-400/15 animate-pulse opacity-60"></div>
              )}
            </div>
            


            {/* Compact Farcaster Toggle */}
            <div className="flex justify-center mb-1">
              <button
                onClick={() => setFarcasterMode(!farcasterMode)}
                className={`
                  backdrop-blur-xl bg-white/10 dark:bg-white/20 border border-white/20 dark:border-white/30
                  rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-300 
                  shadow-lg hover:shadow-xl hover:scale-105
                  ${farcasterMode 
                    ? 'bg-purple-600/80 dark:bg-purple-400/30 border-purple-500/50 dark:border-purple-400/50 shadow-purple-500/25' 
                    : 'hover:bg-white/15 dark:hover:bg-white/25'
                  }
                `}
              >
                <SiFarcaster className={`w-3 h-3 transition-colors duration-300 ${
                  farcasterMode ? 'text-white dark:text-gray-800' : 'text-purple-400 dark:text-purple-600'
                }`} />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  farcasterMode ? 'text-white dark:text-gray-800' : 'text-white/80 dark:text-gray-600'
                }`}>
                  {farcasterMode ? 'Farcaster Mode' : 'Switch to Farcaster'}
                </span>
                {farcasterMode && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-white/20 dark:bg-gray-600/40 text-white/90 dark:text-gray-200 rounded-md">
                    β
                  </span>
                )}
              </button>
            </div>
            
            {/* Optimized Farcaster Beta Notice */}
            {farcasterMode && (
              <div className="flex justify-center mb-1">
                <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-md bg-blue-900/15 dark:bg-blue-400/20 border border-blue-500/20 dark:border-blue-400/30 rounded-xl text-blue-200/80 dark:text-blue-700 text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-600 rounded-full animate-pulse"></span>
                  <span>Experimental feature</span>
                </div>
              </div>
            )}
            


          </div>
          

            


          {searchMutation.error && (
            <div className="glass-error-message">
              {searchMutation.error.message}
            </div>
          )}
          
          {/* Reduced auto-detection component space */}
          <div className="h-8"></div>

          {/* Built On Ethos Network text at bottom edge */}
          <div className="absolute bottom-2 left-6 right-6">
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <span className="text-white/60 dark:text-gray-600">Built On Ethos Network</span>
              <img 
                src="https://i.ibb.co/jPDG2NX5/ethos-network1719934757538-removebg-preview.png" 
                alt="Ethos Logo" 
                className="w-5 h-5 opacity-60 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
      <LoadingOverlay 
        isVisible={searchMutation.isPending} 
        message="Loading profile data and analyzing trust patterns..."
      />
    </>
  );
}
