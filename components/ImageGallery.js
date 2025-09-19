"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function ImageGallery({ images, altText }) {
  const [activeImage, setActiveImage] = useState(images && images.length > 0 ? images[0] : null);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No Image</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative w-full max-w-full rounded-lg overflow-hidden border">
        <Image
          src={activeImage}
          alt={altText}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-auto object-contain transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnails - only show if there is more than one image */}
      {images.length > 1 && (
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Images:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
            {Array.from({ length: images.length }, (_, index) => {
              const imageUrl = images[index];
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(imageUrl)}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-colors touch-target ${
                    activeImage === imageUrl ? 'border-indigo-500' : 'border-gray-300'
                  } hover:border-indigo-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${altText} thumbnail ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                    onError={(e) => {
                      console.error(`Failed to load thumbnail ${index}:`, imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
