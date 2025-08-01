import { Network, Shield, CheckCircle2 } from 'lucide-react';
import { EthosStatus } from '@/components/ethos-status';

export function HeroTagline() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4 relative z-0">
      <div className="text-center relative">
        {/* Main Tagline - Enhanced Mobile Light Theme */}
        <div className="relative mb-4 z-0">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-bold leading-tight sm:text-2xl">
            <span className="text-gray-800 dark:text-gray-800 drop-shadow-lg sm:drop-shadow-md" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.2)' }}>
              Who's Who?
            </span>
            <br />
            <span className="text-blue-600 dark:text-blue-300 drop-shadow-lg sm:drop-shadow-md" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.2)' }}>
              The Network Knows.
            </span>
          </h2>
          
          {/* Verification Badge - Enhanced Mobile Light Theme */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 sm:px-3 sm:py-1.5 backdrop-blur-md bg-white/80 dark:bg-white/15 border border-green-200/50 dark:border-amber-900/25 rounded-full shadow-xl hover:bg-white/90 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Shield className="w-4 h-4 sm:w-3 sm:h-3 text-green-600 dark:text-green-600" />
            <span className="text-gray-800 dark:text-gray-700 text-sm sm:text-xs font-semibold dark:font-medium" style={{ textShadow: 'none' }}>Verified on Ethos</span>
            <CheckCircle2 className="w-4 h-4 sm:w-3 sm:h-3 text-green-600 dark:text-green-600" />
          </div>
          
          {/* API Status - positioned below verification badge in a new line */}
          <div className="mt-2">
            <EthosStatus />
          </div>
        </div>



        {/* Static decorative elements - hidden in dark mode for clean appearance */}
        <div className="absolute -top-4 left-8 w-6 h-6 bg-gradient-to-br from-cyan-400/15 to-blue-400/8 rounded-full blur-sm hidden md:block md:animate-pulse dark:hidden"></div>
        <div className="absolute top-12 right-12 w-4 h-4 bg-gradient-to-br from-purple-400/15 to-pink-400/8 rounded-full blur-sm hidden md:block md:animate-pulse dark:hidden" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-8 left-16 w-3 h-3 bg-gradient-to-br from-green-400/15 to-cyan-400/8 rounded-full blur-sm hidden md:block md:animate-pulse dark:hidden" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
}