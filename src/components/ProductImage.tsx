'use client';

import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  enableZoom?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  enableZoom = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
          <Package className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-zinc-500 line-clamp-2">{alt}</span>
        <span className="text-[10px] text-zinc-400 mt-0.5">SokoNova Verified SKU</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-100 group">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-transform duration-500 ${
          enableZoom ? 'group-hover:scale-105' : ''
        } ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};