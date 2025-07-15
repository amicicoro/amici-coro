'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Update the interface to handle photo objects with url property
interface PhotoGalleryProps {
  photos: Array<{ url: string } | string>;
  alt: string;
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Helper function to get the photo URL regardless of format
  const getPhotoUrl = (photo: { url: string } | string): string => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  const handleOpenPhoto = (index: number) => {
    setCurrentIndex(index);
    setIsDialogOpen(true);
  };

  const handlePrevPhoto = () => {
    setCurrentIndex(
      prevIndex => (prevIndex - 1 + photos.length) % photos.length,
    );
  };

  const handleNextPhoto = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % photos.length);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevPhoto();
    } else if (e.key === 'ArrowRight') {
      handleNextPhoto();
    } else if (e.key === 'Escape') {
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
        {photos.map((photo, index) => (
          <div
            key={index}
            className='aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
            onClick={() => handleOpenPhoto(index)}
          >
            <Image
              src={getPhotoUrl(photo) || '/placeholder.svg'}
              alt={`${alt} - Photo ${index + 1}`}
              fill
              sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
              className='object-cover'
            />
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className='max-w-5xl w-[95vw] p-0 bg-black/95'
          onKeyDown={handleKeyDown}
          onInteractOutside={e => e.preventDefault()}
        >
          <div className='relative h-[80vh] flex items-center justify-center'>
            <div className='relative w-full h-full flex items-center justify-center'>
              <Image
                src={getPhotoUrl(photos[currentIndex]) || '/placeholder.svg'}
                alt={`${alt} - Photo ${currentIndex + 1}`}
                fill
                sizes='95vw'
                className='object-contain'
                priority
              />
            </div>

            {/* Close button */}
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='absolute top-4 right-4 text-white hover:bg-black/50 z-10'
              >
                <X className='h-6 w-6' />
                <span className='sr-only'>Close</span>
              </Button>
            </DialogTrigger>

            {/* Navigation buttons */}
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 z-10 h-12 w-12 rounded-full'
              onClick={handlePrevPhoto}
            >
              <ChevronLeft className='h-8 w-8' />
              <span className='sr-only'>Previous photo</span>
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 z-10 h-12 w-12 rounded-full'
              onClick={handleNextPhoto}
            >
              <ChevronRight className='h-8 w-8' />
              <span className='sr-only'>Next photo</span>
            </Button>

            {/* Photo counter */}
            <div className='absolute bottom-4 left-0 right-0 text-center text-white text-sm'>
              {currentIndex + 1} of {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
