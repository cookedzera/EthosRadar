// Performance utilities for mobile optimization

export const isMobile = () => {
  return window.innerWidth <= 430;
};

export const isSlowDevice = () => {
  // Detect if device has limited resources
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory <= 4;
  }
  // Fallback: detect slow devices by connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  return false;
};

export const shouldReduceAnimations = () => {
  // Check for user preference for reduced motion
  if ('matchMedia' in window) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const optimizeForMobile = () => {
  const mobile = isMobile();
  const slow = isSlowDevice();
  const reduceMotion = shouldReduceAnimations();
  
  return {
    mobile,
    slow,
    reduceMotion,
    disableAnimations: mobile || slow || reduceMotion,
    reduceBlur: mobile || slow,
    lazySkeleton: mobile || slow
  };
};

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Preload critical images
export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  const { mobile, slow } = optimizeForMobile();
  
  // Preload critical background images for faster loading
  if (!slow) {
    // Only preload on faster devices
    preloadImage('/unified-bg.webp');
    preloadImage('/logo.webp');
  }
  
  // Add performance hints to document
  if (mobile) {
    document.documentElement.style.setProperty('--blur-amount', '4px');
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
  } else {
    document.documentElement.style.setProperty('--blur-amount', '12px');
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
  }
};