import { Network, Shield, CheckCircle2 } from 'lucide-react';
import { EthosStatus } from '@/components/ethos-status';

export function HeroTagline() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4 relative z-0">
      <div className="text-center relative">
        {/* Main Tagline */}
        <div className="relative mb-4 z-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-white dark:text-gray-100 light:text-gray-900 drop-shadow-2xl font-extrabold" style={{ 
              textShadow: 'var(--text-shadow-main)',
              WebkitTextStroke: '1px rgba(0,0,0,0.3)'
            }}>
              Who's Who?
            </span>
            <br />
            <span className="text-blue-300 dark:text-blue-500 light:text-blue-900 font-bold" style={{ 
              textShadow: 'var(--subtitle-shadow)',
              WebkitTextStroke: '0.5px rgba(0,0,0,0.2)'
            }}>
              The Network Knows.
            </span>
          </h2>
          
          {/* Verification Badge */}
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 backdrop-blur-sm bg-white/15 border border-amber-900/25 rounded-full shadow-lg hover:bg-white/20 transition-all duration-300">
            <Shield className="w-3 h-3 text-green-400 dark:text-green-600" />
            <span className="text-white dark:text-gray-800 light:text-gray-900 text-xs font-semibold dark:font-medium light:font-black" style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 4px rgba(255,255,255,0.8)',
              WebkitTextStroke: '0.3px rgba(0,0,0,0.3)'
            }}>Verified on Ethos</span>
            <CheckCircle2 className="w-3 h-3 text-green-400 dark:text-green-600" />
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