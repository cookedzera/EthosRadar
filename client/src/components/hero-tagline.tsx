import { Network, Shield, CheckCircle2 } from 'lucide-react';
import { EthosStatus } from '@/components/ethos-status';

export function HeroTagline() {
  return (
    <div className="w-full max-w-5xl mx-auto mb-16 px-4 relative">
      <div className="text-center relative">
        {/* Warpcast-Style Main Tagline */}
        <div className="relative mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 font-display">
            <span className="gradient-warp text-glow">
              Who Do You Trust?
            </span>
            <br />
            <span className="gradient-base">
              Let The Network Decide.
            </span>
          </h2>
          
          {/* Modern Verification Badge */}
          <div className="inline-flex items-center gap-4 warp-card px-8 py-4 hover-scale">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-bold">Powered by Ethos Network</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </div>
          
          {/* Enhanced API Status with Warpcast styling */}
          <div className="mt-8">
            <EthosStatus />
          </div>
        </div>

        {/* Warpcast-style Floating Elements */}
        <div className="absolute -top-12 left-16 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/15 rounded-full blur-xl float-bounce"></div>
        <div className="absolute top-20 right-20 w-8 h-8 bg-gradient-to-br from-cyan-500/25 to-blue-500/15 rounded-full blur-lg float-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-16 left-24 w-6 h-6 bg-gradient-to-br from-green-500/20 to-emerald-500/15 rounded-full blur-lg float-bounce" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional accent elements */}
        <div className="absolute top-1/2 -right-8 w-4 h-4 bg-purple-400/40 rounded-full pulse-accent"></div>
        <div className="absolute bottom-1/4 -left-6 w-3 h-3 bg-cyan-400/50 rounded-full pulse-accent" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}