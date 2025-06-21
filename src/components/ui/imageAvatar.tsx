'use client';

import Image from 'next/image';
import * as React from 'react';

interface ImageAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  priority?: boolean; // <--- ADD THIS LINE
}

const ImageAvatar: React.FC<ImageAvatarProps> = ({ src, alt = 'Product Image', size = 65, priority }) => { // <--- ADD 'priority' HERE

  // Fallback placeholder and error images. Make sure these exist in your `public` folder.
  const placeholderSrc = '/Box.png'; // e.g., a generic grey box
  const errorSrc = '/Box.png'; // e.g., a broken image icon

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
  // If src is undefined or null, it will fallback to placeholderSrc
  const isValidSrc = typeof src === 'string' && src.trim() !== '' && src.trim().toUpperCase() !== 'NULL';
  const isDataUrl = isValidSrc && src.startsWith('data:');
  const currentImageSrc = imgError || !isValidSrc ? errorSrc : src!;


  return (
    <div
      style={{
        position: 'relative', // Essential for next/image with 'fill'
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '5px', // For avatar shape
        overflow: 'hidden',
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0, // Prevent shrinking in flex layouts
      }}
    >
      {isDataUrl ? (
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
          style={{ objectFit: 'cover' }} // Add this to ensure proper LCP-friendly rendering
        />

      )}
    </div>
  );
};

export default ImageAvatar;