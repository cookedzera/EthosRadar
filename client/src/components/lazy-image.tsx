import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ src, alt, className, fallback, onLoad, onError }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      onError?.();
    }
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
        />
      )}
      {!isLoaded && imageSrc && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse rounded-full" />
      )}
      {!imageSrc && (
        <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">
            {alt?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
    </div>
  );
}