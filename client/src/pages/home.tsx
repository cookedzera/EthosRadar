import { MinimalWalletScanner } from '@/components/minimal-wallet-scanner';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal clean header */}
      <div className="pt-16 pb-8">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Trust Score
            </h1>
            <p className="text-gray-500 text-sm font-normal">
              Check wallet reputation
            </p>
          </div>
          
          {/* Search Component */}
          <MinimalWalletScanner />
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  );
}