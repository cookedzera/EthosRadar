import { useState } from 'react';
import { MinimalWalletScanner } from '@/components/minimal-wallet-scanner';
import { UserProfileView } from '@/components/user-profile-view';

export function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<'farcaster' | 'global'>('global');

  const handleUserFound = (userData: any, mode: 'farcaster' | 'global') => {
    setUser(userData);
    setSearchMode(mode);
  };

  const handleBackToSearch = () => {
    setUser(null);
  };

  if (user) {
    return (
      <UserProfileView 
        user={user} 
        onBackToSearch={handleBackToSearch} 
        onUserSearch={(userData) => setUser(userData)}
        searchMode={searchMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#c7c8c9]">
      {/* Main Container - Centered like reference */}
      <div className="max-w-sm mx-auto px-6 py-16">
        
        {/* Header Section - Big typography like reference */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extralight text-gray-900 mb-3 tracking-tight">
            Trust Score
          </h1>
          <p className="text-gray-500 text-base font-normal">
            Check wallet reputation
          </p>
        </div>
        
        {/* Search Card - Contained like reference */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-8 shadow-sm border-0">
          <MinimalWalletScanner onUserFound={handleUserFound} />
        </div>
        
        {/* Example Names - As pills like reference */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">Try searching:</p>
          <div className="flex flex-wrap gap-2">
            {['vitalik.eth', 'cookedzera', 'dwr.eth', 'balajis.eth'].map((name) => (
              <button
                key={name}
                onClick={() => {
                  // Auto-fill search with example name
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.value = name;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
                className="bg-white rounded-full px-4 py-2 text-sm text-gray-700 hover:shadow-md transition-all shadow-sm border-0"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Features Grid - Clean cards like reference */}
        <div className="mt-16 space-y-4">
          <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Trust Analytics</h3>
                <p className="text-sm text-gray-500">Real-time reputation scoring</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Network Mapping</h3>
                <p className="text-sm text-gray-500">Visualize trust connections</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-2xl p-6 shadow-sm border-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Risk Detection</h3>
                <p className="text-sm text-gray-500">Identify reputation farming</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}