import { useState } from 'react';
import { Landmark } from 'lucide-react';

interface HeritageImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function HeritageImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: HeritageImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#F3ECE0] via-[#EBE2D0] to-[#E3D5BA] flex flex-col items-center justify-center p-6 text-center text-[#6B1D2F] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Landmark className="w-8 h-8 opacity-60 mb-2" strokeWidth={1.5} />
        {fallbackTitle && (
          <span className="font-serif text-base font-semibold tracking-wide text-[#4E1220] line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
