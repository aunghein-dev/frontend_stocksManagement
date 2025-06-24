// src/components/common/ImageAvatar.tsx
'use client';

import Image from 'next/image';
import * as React from 'react';

interface ImageAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  priority?: boolean; // This prop receives the conditional value (e.g., from DataGrid)
}

const ImageAvatar: React.FC<ImageAvatarProps> = ({ src, alt = 'Product Image', size = 65, priority }) => { // Receives 'priority' prop
  // Fallback placeholder and error images. Make sure these exist in your `public` folder.
  const placeholderSrc = '/Box.png';
  const errorSrc = '/Box.png';

  // State to handle image loading errors
  const [imgError, setImgError] = React.useState(false);

  // Reset error state if the image source changes
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  // Handle image loading errors by setting the error state
  const handleError = () => {
    setImgError(true);
  };

  // Determine the actual image source to use
  const isValidSrc = typeof src === 'string' && src.trim() !== '' && src.trim().toUpperCase() !== 'NULL';
  const isDataUrl = isValidSrc && src.startsWith('data:');
  const currentImageSrc = imgError || !isValidSrc ? errorSrc : src!;


  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '5px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {isDataUrl ? (
        <img
          src={currentImageSrc}
          alt={alt}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={handleError}
          fetchPriority="high" // This is for <img> tag, not next/image. Good to keep if needed.
        />
      ) : (
        <Image
          src={currentImageSrc}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={handleError}
          priority={priority} // <--- CORRECTED: PASS THE PROP HERE!
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

export default ImageAvatar;