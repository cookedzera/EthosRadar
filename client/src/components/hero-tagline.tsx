import { Network, Shield, CheckCircle2 } from 'lucide-react';
import { EthosStatus } from '@/components/ethos-status';

export function HeroTagline() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4 relative z-0">
      <div className="text-center relative">
        {/* Main Tagline */}
        <div className="relative mb-4 z-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="hero-title-text">
              Who's Who?
            </span>
            <br />
            <span className="hero-subtitle-text">
              The Network Knows.
            </span>
          </h2>
          
          {/* Verification Badge */}
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 backdrop-blur-sm bg-white/15 dark:bg-white/10 border border-amber-900/25 dark:border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all duration-300">
            <Shield className="w-3 h-3 text-green-400 dark:text-green-400" />
            <span className="hero-badge-text text-xs">Verified on Ethos</span>
            <CheckCircle2 className="w-3 h-3 text-green-400 dark:text-green-400" />
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