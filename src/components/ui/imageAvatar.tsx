// src/components/common/ImageAvatar.tsx
'use client';

import Image from 'next/image';
import * as React from 'react';

interface ImageAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  priority?: boolean;
}

const ImageAvatar: React.FC<ImageAvatarProps> = ({ src, alt = 'Product Image', size = 65, priority }) => {
  const errorSrc = '/Box.png';

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const handleError = () => {
    setImgError(true);
  };

  const isValidSrc = typeof src === 'string' && src.trim() !== '' && src.trim().toUpperCase() !== 'NULL';
  const isDataUrl = isValidSrc && src.startsWith('https:');
  const currentImageSrc = imgError || !isValidSrc ? errorSrc : src!;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {isDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentImageSrc}
          alt={alt}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={handleError}
          fetchPriority="high"
        />
      ) : (
        <Image
          src={currentImageSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={handleError}
          priority={priority}
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      )}
    </div>
  );
};

export default ImageAvatar;