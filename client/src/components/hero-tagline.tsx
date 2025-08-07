import { Network, Shield, CheckCircle2 } from 'lucide-react';
import { EthosStatus } from '@/components/ethos-status';

export function HeroTagline() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4 relative">
      <div className="text-center relative">
        {/* Enhanced Main Tagline */}
        <div className="relative mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
              Who's Who?
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              The Network Knows.
            </span>
          </h2>
          
          {/* Enhanced Verification Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 neo-card bg-opacity-40 floating-animation">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-slate-200 text-sm font-bold">Verified on Ethos Network</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          
          {/* Enhanced API Status */}
          <div className="mt-6">
            <EthosStatus />
          </div>
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute -top-8 left-12 w-8 h-8 bg-gradient-to-br from-cyan-400/25 to-blue-400/15 rounded-full blur-lg floating-animation"></div>
        <div className="absolute top-16 right-16 w-6 h-6 bg-gradient-to-br from-purple-400/20 to-pink-400/15 rounded-full blur-lg floating-animation" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-12 left-20 w-4 h-4 bg-gradient-to-br from-green-400/20 to-cyan-400/15 rounded-full blur-lg floating-animation" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
}