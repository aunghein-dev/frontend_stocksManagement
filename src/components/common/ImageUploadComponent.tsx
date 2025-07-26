// src/components/common/ImageUploadComponent.tsx
import React, { useCallback, useRef, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { PhotoIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'; // Adjust paths as per your setup
import { useTranslation } from '@/hooks/useTranslation';

interface ImageUploadProps {
  id: string; // Unique ID for the input
  label: string;
  currentImageUrl: string | null;
  onImageSelected: (file: File | null) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string; // Optional for external styling
  priority?: boolean; 
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({
  id,
  label,
  currentImageUrl,
  onImageSelected,
  isLoading = false,
  error = null,
  className = "",
  priority = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    } else {
      // If the file input is cleared (e.g., user selects then cancels),
      // we should also notify the parent that no file is selected.
      onImageSelected(null);
    }
  }, [onImageSelected]);

  const handleRemoveImage = useCallback(() => {
    onImageSelected(null);
    // Crucially, reset the file input's value so that the user can
    // select the *same* file again immediately if they wanted to.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Essential to allow drop
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    // No need to clear fileInputRef.current.value here if a file was dropped,
    // as onImageSelected will handle the new file.
  }, [onImageSelected]);

  const { t } = useTranslation();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      
      <div
        className={`relative border-[0.5px] border-dashed rounded-xs p-4 text-center flex flex-col items-center justify-center min-h-[120px] transition-colors duration-200 sm:py-6
          ${isDragOver ? 'border-blue-600 bg-blue-50' : 'border-gray-500 bg-white'}
          ${error ? 'border-red-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor={id} className="absolute -top-2.5 left-2 text-[0.78rem] font-medium text-black/60 ml-1 px-1 bg-white">
        {label}
      </label>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Image Preview or Upload Prompt */}
        {currentImageUrl ? (
          <div className="relative w-24 h-24 mb-1 rounded-xs overflow-hidden border border-gray-200 ">
            <Image
              src={currentImageUrl}
              alt="Preview"
              priority={priority}
              fill // Makes the image fill the parent div
              sizes="(max-width: 768px) 100vw, 96px" // Example sizes, adjust if necessary
              className="object-cover"
              onError={(e) => {
                // Fallback for broken images. Ensure this placeholder exists in /public.
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
                (e.target as HTMLImageElement).alt = "Image not available";
              }}
            />
            {/* Remove Button for Image */}
             <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Remove image"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <CloudArrowUpIcon className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">{t("lbl_imgUploadIO")}</p>
          </div>
        )}

        {/* File Input and Button */}
        <label
          htmlFor={id}
          className="cursor-pointer inline-flex items-center px-4 py-2 mt-2 border border-blue-600 rounded-xs shadow-sm text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <PhotoIcon className="w-4 h-4 mr-2" /> {t("lbl_selectImg")}
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only" // Hidden visually, but accessible
            disabled={isLoading} // Disable input when loading
          />
        </label>
        {/* File Type and Size Hint */}
        <p className="mt-2 text-[0.68rem] text-gray-500 hidden sm:block">PNG, JPG, JPEG, GIF up to 10MB</p>
        {/* Error Message */}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploadComponent;