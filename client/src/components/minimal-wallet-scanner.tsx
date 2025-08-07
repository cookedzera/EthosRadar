import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MinimalWalletScannerProps {
  onSearch?: (query: string) => void;
}

export function MinimalWalletScanner({ onSearch }: MinimalWalletScannerProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Minimal search input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter wallet address or ENS"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full h-12 pl-4 pr-12 text-base border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
        />
        
        {/* Search icon */}
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      
      {/* Quick examples */}
      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-400 text-center">Try these examples:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['vitalik.eth', 'nick.eth', 'optimism.eth'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
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