import { useState, useEffect } from 'react';
import { optimizeForMobile } from '@/utils/performance';

interface OptimizedProfileLoaderProps {
  userkey: string;
  children: (loadingState: {
    loadCritical: boolean;
    loadSecondary: boolean;
    loadTertiary: boolean;
  }) => React.ReactNode;
}

export function OptimizedProfileLoader({ userkey, children }: OptimizedProfileLoaderProps) {
  const [loadCritical, setLoadCritical] = useState(false);
  const [loadSecondary, setLoadSecondary] = useState(false);
  const [loadTertiary, setLoadTertiary] = useState(false);

  const { mobile, slow } = optimizeForMobile();

  useEffect(() => {
    if (!userkey) return;

    // Immediate: Load critical data (trust score, basic profile)
    setLoadCritical(true);

    // After 100ms: Load secondary data (stats, attestations)
    const secondaryTimer = setTimeout(() => {
      setLoadSecondary(true);
    }, mobile || slow ? 200 : 100);

    // After 300ms: Load tertiary data (R4R, activities)
    const tertiaryTimer = setTimeout(() => {
      setLoadTertiary(true);
    }, mobile || slow ? 500 : 300);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(tertiaryTimer);
    };
  }, [userkey, mobile, slow]);

  return (
    <>
      {children({
        loadCritical,
        loadSecondary,
        loadTertiary,
      })}
    </>
  );
}