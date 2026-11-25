import { Package } from 'lucide-react';
import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#5F1317] via-[#0B2B20] to-[#1A080B] text-[#FDE047] px-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-8 h-8 mb-2 stroke-[1.5] text-[#FBBF24]" aria-hidden="true" />
        <span className="text-xs font-semibold leading-snug max-w-[200px] truncate text-[#FFFBEB]">
          {fallbackTitle ?? alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
