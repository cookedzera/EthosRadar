import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';

interface RealTimeRefreshButtonProps {
  userkey?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function RealTimeRefreshButton({ 
  userkey, 
  variant = 'outline', 
  size = 'sm',
  className 
}: RealTimeRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Clear all cached data for this user
      if (userkey) {
        queryClient.invalidateQueries({ queryKey: ['api', 'trust-score', userkey] });
        queryClient.invalidateQueries({ queryKey: ['api', 'enhanced-profile', userkey] });
        queryClient.invalidateQueries({ queryKey: ['api', 'user-stats', userkey] });
        queryClient.invalidateQueries({ queryKey: ['api', 'weekly-activities', userkey] });
        queryClient.invalidateQueries({ queryKey: ['api', 'user-vouch-activities', userkey] });
        queryClient.invalidateQueries({ queryKey: ['api', 'r4r-analysis', userkey] });
      } else {
        // General refresh
        queryClient.invalidateQueries();
      }

      // Wait for fresh data to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={className}
    >
      {showSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          <span>Updated</span>
        </>
      ) : (
        <>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </>
      )}
    </Button>
  );
}