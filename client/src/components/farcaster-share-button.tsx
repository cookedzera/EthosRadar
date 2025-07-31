import { useState, useEffect } from 'react';
import { Share, ExternalLink, Copy } from 'lucide-react';
import { SiFarcaster } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterShareButtonProps {
  user: {
    displayName?: string;
    username?: string;
    score?: number;
    userkeys?: string[];
  };
  compact?: boolean;
}

export function FarcasterShareButton({ user, compact = false }: FarcasterShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkCapabilities, setSdkCapabilities] = useState<string[]>([]);
  
  const userkey = user?.userkeys?.[0] || '';
  const displayName = user?.displayName || user?.username || 'Anonymous';
  const score = user?.score || 0;
  
  // Generate frame URL
  const baseUrl = window.location.origin;
  const frameUrl = `${baseUrl}/farcaster/frame/${encodeURIComponent(userkey)}`;
  
  // Generate concise cast text for better readability
  const castText = `Trust Score: ${score} | ${getScoreLevel(score)} Tier 🏆

Check yours at ethosradar.com by @cookedzera`;

  // Enhanced SDK detection and initialization
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        console.log('🔍 Initializing Farcaster SDK detection...');
        
        // Method 1: Check if SDK is available in window context
        if (typeof window !== 'undefined' && (window as any).farcaster) {
          console.log('✅ Farcaster SDK detected in window context');
          setSdkReady(true);
        }
        
        // Method 2: Test SDK capabilities
        try {
          const capabilities = await sdk.getCapabilities();
          console.log('✅ SDK capabilities detected:', capabilities);
          setSdkCapabilities(capabilities);
          setSdkReady(true);
        } catch (sdkError) {
          console.log('⚠️ SDK capabilities not available:', sdkError);
        }
        
        // Method 3: Test context access
        try {
          const context = await sdk.context;
          if (context) {
            console.log('✅ SDK context available:', context);
            setSdkReady(true);
          }
        } catch (contextError) {
          console.log('⚠️ SDK context not available:', contextError);
        }
        
        // Log final status
        console.log(`🎯 Final SDK status - Ready: ${sdkReady}, Capabilities: ${sdkCapabilities.length}`);
        
      } catch (error) {
        console.log('❌ SDK initialization failed:', error);
      }
    };
    
    initializeSDK();
  }, []);

  function getScoreLevel(score: number): string {
    if (score >= 2000) return 'Exemplary';
    if (score >= 1600) return 'Reputable';
    if (score >= 1200) return 'Neutral';
    if (score >= 800) return 'Questionable';
    return 'Untrusted';
  }

  // Enhanced direct cast composition using Farcaster SDK
  const handleFlex = async () => {
    try {
      console.log('🎯 Flex Your Card clicked - attempting direct cast composition...');
      
      // Method 1: Try direct composeCast first (most reliable in Mini App)
      try {
        console.log('📱 Attempting native composeCast...');
        const result = await sdk.actions.composeCast({
          text: castText,
          embeds: [frameUrl],
          close: false // Don't close the app after casting
        });
        
        console.log('✅ Native composeCast completed successfully');
        if (result?.cast) {
          console.log(`🎉 Cast created with hash: ${result.cast.hash}`);
        }
        return;
      } catch (sdkError) {
        console.log('⚠️ Native composeCast not available, trying alternatives...');
      }
      
      // Method 2: Check if we're in Mini App context and use openUrl
      try {
        const context = await sdk.context;
        if (context) {
          console.log('📱 Mini App context detected, using openUrl...');
          const warpcastIntentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(frameUrl)}`;
          await sdk.actions.openUrl(warpcastIntentUrl);
          console.log('✅ OpenUrl completed successfully');
          return;
        }
      } catch (contextError) {
        console.log('⚠️ No Mini App context, falling back to web methods...');
      }
      
      // Method 3: Web browser fallback with intent URL
      console.log('🌐 Using web browser fallback...');
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(frameUrl)}`;
      
      // For mobile browsers, try location.href first as it's more reliable
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('📱 Mobile browser detected, using location redirect...');
        window.location.href = warpcastUrl;
        return;
      }
      
      // For desktop, try window.open
      console.log('💻 Desktop browser detected, using window.open...');
      const newWindow = window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed) {
        // Fallback to location.href if popup blocked
        console.log('🚫 Popup blocked, redirecting...');
        window.location.href = warpcastUrl;
        return;
      }
      
      console.log('✅ Warpcast opened successfully');
      
    } catch (error) {
      console.error('❌ All cast methods failed:', error);
      // Final emergency fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(`${castText}\n\n${frameUrl}`);
        alert('Cast text copied to clipboard! Please paste in Warpcast to share.');
      } catch (clipError) {
        alert(`Please copy this text to share on Farcaster:\n\n${castText}\n\n${frameUrl}`);
      }
    }
  };

  const openWarpcast = async () => {
    await handleFlex(); // Use the same logic
  };

  const openFarcaster = () => {
    window.open(frameUrl, '_blank');
  };

  // Direct redirect function without popup
  const handleFlexClick = async () => {
    await openWarpcast();
  };

  const copyFrameUrl = async () => {
    try {
      await navigator.clipboard.writeText(frameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Handle error silently in production
    }
  };

  if (compact) {
    return (
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await handleFlex();
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 transition-all duration-300 text-xs font-medium group ml-2"
      >
        <SiFarcaster className="w-3 h-3 transition-transform group-hover:scale-110" />
        <span>Flex</span>
      </button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <Share className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Share Your Trust Score on Farcaster</DialogTitle>
        <DialogDescription>
          Share your trust reputation card as a Farcaster frame
        </DialogDescription>
        
        {/* SDK Status Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <div className="font-semibold mb-1">SDK Status:</div>
          <div>Ready: {sdkReady ? '✅ Yes' : '❌ No'}</div>
          <div>Capabilities: {sdkCapabilities.length > 0 ? sdkCapabilities.join(', ') : 'None detected'}</div>
        </div>
        
        <div className="space-y-4">
          {/* Preview of the frame */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Frame Preview:</div>
            <div className="bg-white dark:bg-gray-700 rounded-md p-3 border">
              <div className="text-lg font-semibold">{displayName}'s Trust Score</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Trust Score: {score} | Check out their reputation on Ethos Protocol
              </div>
              <div className="mt-2 flex gap-2">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                  Check Your Score
                </div>
                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                  View Profile
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={openWarpcast}
              className="flex items-center justify-center gap-2 w-full"
            >
              <Share className="w-4 h-4" />
              Cast on Warpcast
            </Button>
            
            <Button 
              variant="outline"
              onClick={openFarcaster}
              className="flex items-center justify-center gap-2 w-full"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Frame
            </Button>
            
            <Button 
              variant="outline"
              onClick={copyFrameUrl}
              className="flex items-center justify-center gap-2 w-full"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Frame URL'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Frame URL: {frameUrl}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}