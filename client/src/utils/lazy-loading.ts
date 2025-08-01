// Lazy loading utilities for components and data
import React from 'react';

export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Intersection Observer for lazy loading content
export class LazyLoader {
  private observer: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, ...options }
    );
  }

  observe(element: Element, callback: () => void) {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }

  disconnect() {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

// Virtualization for long lists
export const useVirtualization = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    setScrollTop,
    totalHeight: items.length * itemHeight,
  };
};

// Priority loading for critical vs non-critical data
export const usePriorityLoading = () => {
  const [criticalLoaded, setCriticalLoaded] = React.useState(false);
  const [nonCriticalLoaded, setNonCriticalLoaded] = React.useState(false);
  
  const loadCritical = React.useCallback(() => {
    setCriticalLoaded(true);
  }, []);
  
  const loadNonCritical = React.useCallback(() => {
    // Only load non-critical after critical is done
    if (criticalLoaded) {
      setNonCriticalLoaded(true);
    }
  }, [criticalLoaded]);
  
  React.useEffect(() => {
    if (criticalLoaded && !nonCriticalLoaded) {
      // Delay non-critical loading by a small amount
      const timer = setTimeout(() => {
        setNonCriticalLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [criticalLoaded, nonCriticalLoaded]);
  
  return {
    criticalLoaded,
    nonCriticalLoaded,
    loadCritical,
    loadNonCritical,
  };
};