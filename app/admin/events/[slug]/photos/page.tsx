'use client';

import {
  ArrowLeft,
  X,
  LayoutDashboard,
  ImageIcon,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileWarning,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type React from 'react';
import { useState, useRef } from 'react';

import { PhotoGallery } from '@/components/photo-gallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Photo {
  url: string;
  pathname: string;
  contentType: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'unsupported';
  error?: string;
}

// List of supported image MIME types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // HEIC is supported but needs conversion
  'image/heic',
  'image/heif',
];

export default function AdminEventPhotosPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload state
  const [photoUploads, setPhotoUploads] = useState<PhotoPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${slug}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData);
      }

      // Fetch photos
      const response = await fetch(`/api/events/${slug}/photos`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch photos: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log

      // Fix: Extract the photos array from the response
      if (data && data.photos && Array.isArray(data.photos)) {
        setPhotos(data.photos);
        console.log('Photos set:', data.photos); // Debug log
      } else {
        console.error('Unexpected photos data format:', data);
        setPhotos([]);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch photos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  // Check if a file is a supported image type
  const isFileSupported = (file: File): boolean => {
    try {
      // Check by MIME type
      if (SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        console.log(`File ${file.name} supported by MIME type: ${file.type}`);
        return true;
      }

      // Check by file extension for HEIC files
      if (
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
      ) {
        console.log(`File ${file.name} supported by extension`);
        return true;
      }

      console.log(
        `File ${file.name} is not supported. MIME type: ${file.type}`,
      );
      return false;
    } catch (error) {
      console.error('Error in isFileSupported:', error);
      // Default to true to avoid blocking uploads due to detection errors
      return true;
    }
  };

  // Process files before adding them to the upload queue
  const processFiles = async (files: File[]): Promise<PhotoPreview[]> => {
    try {
      console.log(`Processing ${files.length} files`);
      setDebugInfo(`Processing ${files.length} files`);

      const processedFiles: PhotoPreview[] = [];

      for (const file of files) {
        console.log(
          `Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`,
        );

        // Create a base preview object
        const preview = URL.createObjectURL(file);
        const photoPreview: PhotoPreview = {
          file,
          preview,
          status: 'pending',
        };

        // Check if file is supported
        if (!isFileSupported(file)) {
          console.log(`File ${file.name} is not supported`);
          photoPreview.status = 'unsupported';
          photoPreview.error = `Unsupported file type: ${file.type || 'unknown'}`;
          processedFiles.push(photoPreview);
          continue;
        }

        processedFiles.push(photoPreview);
      }

      console.log(`Processed ${processedFiles.length} files successfully`);
      setDebugInfo(`Processed ${processedFiles.length} files successfully`);
      return processedFiles;
    } catch (error) {
      console.error('Error in processFiles:', error);
      setDebugInfo(
        `Error processing files: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Return empty array to avoid breaking the upload flow
      return [];
    }
  };

  // Upload handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('File input change event triggered');
      setDebugInfo('File input change event triggered');

      if (!e.target.files || e.target.files.length === 0) {
        console.log('No files selected');
        setDebugInfo('No files selected');
        return;
      }

      console.log(`${e.target.files.length} files selected`);
      setDebugInfo(`${e.target.files.length} files selected`);

      const files = Array.from(e.target.files);

      // Process files (check support, convert HEIC)
      const newPhotos = await processFiles(files);

      if (newPhotos.length > 0) {
        console.log(`Adding ${newPhotos.length} new photos to upload queue`);
        setPhotoUploads(prev => [...prev, ...newPhotos]);
        setDebugInfo(`Added ${newPhotos.length} photos to upload queue`);
      } else {
        console.log('No valid photos to add to upload queue');
        setDebugInfo('No valid photos to add to upload queue');
      }
    } catch (error) {
      console.error('Error in handleFileChange:', error);
      setDebugInfo(
        `Error handling file selection: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Visual feedback for drag over
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Remove visual feedback
    e.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = async (e: React.DragEvent) => {
    try {
      e.preventDefault();
      // Remove visual feedback
      e.currentTarget.classList.remove('border-primary');

      console.log('Drop event triggered');
      setDebugInfo('Drop event triggered');

      if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        console.log('No files dropped');
        setDebugInfo('No files dropped');
        return;
      }

      console.log(`${e.dataTransfer.files.length} files dropped`);
      setDebugInfo(`${e.dataTransfer.files.length} files dropped`);

      const files = Array.from(e.dataTransfer.files);

      // Process files (check support, convert HEIC)
      const newPhotos = await processFiles(files);

      if (newPhotos.length > 0) {
        console.log(`Adding ${newPhotos.length} new photos to upload queue`);
        setPhotoUploads(prev => [...prev, ...newPhotos]);
        setDebugInfo(`Added ${newPhotos.length} photos to upload queue`);
      } else {
        console.log('No valid photos to add to upload queue');
        setDebugInfo('No valid photos to add to upload queue');
      }
    } catch (error) {
      console.error('Error in handleDrop:', error);
      setDebugInfo(
        `Error handling dropped files: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleRemoveFile = (preview: string) => {
    // Find the photo
    const photo = photoUploads.find(p => p.preview === preview);
    if (!photo) return;

    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photo.preview);

    // Remove the photo
    setPhotoUploads(prev => prev.filter(p => p.preview !== preview));
  };

  // New function to handle retrying a failed upload
  const handleRetryUpload = async (preview: string) => {
    // Find the photo to retry
    const photoToRetry = photoUploads.find(
      p =>
        p.preview === preview &&
        (p.status === 'failed' || p.status === 'unsupported'),
    );
    if (!photoToRetry) return;

    // For unsupported files, we can't retry
    if (photoToRetry.status === 'unsupported') {
      alert(
        'This file type is not supported. Please upload a supported image format.',
      );
      return;
    }

    // Update status to uploading
    setPhotoUploads(prev =>
      prev.map(p =>
        p.preview === preview
          ? { ...p, status: 'uploading', error: undefined }
          : p,
      ),
    );

    try {
      // Get the admin auth token
      const token = localStorage.getItem('adminAuthToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create a FormData object
      const formData = new FormData();

      // Use the converted file if available (for HEIC files)
      const fileToUpload = photoToRetry.convertedFile || photoToRetry.file;
      formData.append('file', fileToUpload);

      // Upload the file
      const response = await fetch(`/api/events/${slug}/photos/upload`, {
        method: 'POST',
        headers: {
          'X-Admin-Auth-Token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      // Update status to completed
      setPhotoUploads(prev =>
        prev.map(p =>
          p.preview === preview ? { ...p, status: 'completed' } : p,
        ),
      );

      // Refresh photos
      fetchPhotos();
    } catch (err) {
      console.error('Error retrying upload:', err);

      // Update status back to failed with the new error
      setPhotoUploads(prev =>
        prev.map(p =>
          p.preview === preview
            ? {
                ...p,
                status: 'failed',
                error: err instanceof Error ? err.message : 'Upload failed',
              }
            : p,
        ),
      );
    }
  };

  const handleUpload = async () => {
    // Only upload pending photos
    const pendingPhotos = photoUploads.filter(p => p.status === 'pending');
    if (pendingPhotos.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Get the admin auth token
      const token = localStorage.getItem('adminAuthToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const totalToUpload = pendingPhotos.length;
      let completed = 0;

      // Set all pending photos to uploading status
      setPhotoUploads(prev =>
        prev.map(p =>
          p.status === 'pending' ? { ...p, status: 'uploading' } : p,
        ),
      );

      // Create an array of promises for parallel uploads
      const uploadPromises = pendingPhotos.map(async photo => {
        try {
          // Create a FormData object
          const formData = new FormData();

          // Use the converted file if available (for HEIC files)
          const fileToUpload = photo.convertedFile || photo.file;
          formData.append('file', fileToUpload);

          // Upload the file
          const response = await fetch(`/api/events/${slug}/photos/upload`, {
            method: 'POST',
            headers: {
              'X-Admin-Auth-Token': token,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload photo');
          }

          // Update status to completed
          setPhotoUploads(prev =>
            prev.map(p =>
              p.preview === photo.preview ? { ...p, status: 'completed' } : p,
            ),
          );

          // Update progress
          completed++;
          setUploadProgress(Math.round((completed / totalToUpload) * 100));

          return { success: true, preview: photo.preview };
        } catch (err) {
          // Update status to failed
          setPhotoUploads(prev =>
            prev.map(p =>
              p.preview === photo.preview
                ? {
                    ...p,
                    status: 'failed',
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : p,
            ),
          );

          // Update progress even for failures
          completed++;
          setUploadProgress(Math.round((completed / totalToUpload) * 100));

          return { success: false, preview: photo.preview, error: err };
        }
      });

      // Wait for all uploads to complete (in parallel)
      await Promise.all(uploadPromises);

      // Refresh photos
      fetchPhotos();
    } catch (err) {
      console.error('Error uploading photos:', err);
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload photos',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className='h-4 w-4 animate-spin text-white' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'failed':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      case 'unsupported':
        return <FileWarning className='h-4 w-4 text-amber-500' />;
      default:
        return null;
    }
  };

  const pendingCount = photoUploads.filter(p => p.status === 'pending').length;
  const completedCount = photoUploads.filter(
    p => p.status === 'completed',
  ).length;
  const failedCount = photoUploads.filter(p => p.status === 'failed').length;
  const unsupportedCount = photoUploads.filter(
    p => p.status === 'unsupported',
  ).length;

  // Function to manually trigger file selection
  const triggerFileSelection = () => {
    console.log('Manually triggering file selection');
    setDebugInfo('Manually triggering file selection');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
      setDebugInfo('Error: File input reference is null');
    }
  };

  return (
    <div className='container max-w-6xl py-12'>
      <div className='flex justify-between items-center mb-8 px-4'>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={handleBackClick}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-4xl font-bold'>Event Photos</h1>
            {event && (
              <p className='text-muted-foreground mt-1'>{event.title}</p>
            )}
          </div>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' asChild className='gap-2'>
            <Link href='/admin'>
              <LayoutDashboard className='h-4 w-4' />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Debug info */}
      {debugInfo && (
        <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <h3 className='font-medium text-blue-800 mb-1'>Debug Information</h3>
          <p className='text-blue-700 text-sm'>{debugInfo}</p>
        </div>
      )}

      {/* Always show upload box at the top */}
      <div className='mb-8 border rounded-lg p-6 bg-white'>
        <h2 className='text-xl font-semibold mb-4'>Upload Photos</h2>

        {uploadError && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4'>
            {uploadError}
          </div>
        )}

        {/* Unsupported file notice */}
        {unsupportedCount > 0 && (
          <div className='bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md mb-4 flex items-start gap-2'>
            <FileWarning className='h-5 w-5 mt-0.5 flex-shrink-0' />
            <div>
              <p className='font-medium'>
                Unsupported files detected ({unsupportedCount})
              </p>
              <p className='text-sm mt-1'>
                Some files are not supported image formats. Please remove them
                and upload only JPG, PNG, GIF, WebP, or HEIC files.
              </p>
            </div>
          </div>
        )}

        {/* File input area */}
        <div
          className='border-2 border-dashed rounded-md p-8 text-center transition-colors hover:bg-muted/50'
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            multiple
            className='hidden'
            disabled={isUploading}
          />
          <ImageIcon className='h-12 w-12 mx-auto text-muted-foreground' />
          <p className='mt-2 text-muted-foreground'>
            {isUploading
              ? 'Upload in progress...'
              : 'Drag and drop photos here, or click to select files'}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Supported formats: JPG, PNG, GIF, WebP, HEIC
          </p>

          {/* Add a visible button as a fallback */}
          <Button
            type='button'
            variant='outline'
            className='mt-4'
            onClick={triggerFileSelection}
            disabled={isUploading}
          >
            Select Files
          </Button>
        </div>

        {/* Upload stats */}
        {photoUploads.length > 0 && (
          <div className='flex flex-wrap gap-2 text-sm text-muted-foreground mt-4'>
            <span>Total: {photoUploads.length}</span>
            {pendingCount > 0 && <span>• Pending: {pendingCount}</span>}
            {completedCount > 0 && (
              <span className='text-green-600'>
                • Completed: {completedCount}
              </span>
            )}
            {failedCount > 0 && (
              <span className='text-red-500'>• Failed: {failedCount}</span>
            )}
            {unsupportedCount > 0 && (
              <span className='text-amber-500'>
                • Unsupported: {unsupportedCount}
              </span>
            )}
          </div>
        )}

        {/* Preview selected files */}
        {photoUploads.length > 0 && (
          <div className='mt-4 space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
              {photoUploads.map((photo, index) => (
                <div key={index} className='relative group'>
                  <div
                    className={`relative aspect-square rounded-md overflow-hidden ${photo.status === 'failed' || photo.status === 'unsupported' ? 'opacity-50' : ''}`}
                  >
                    <Image
                      src={photo.preview || '/placeholder.svg'}
                      alt={`Preview ${index + 1}`}
                      fill
                      className='object-cover'
                    />

                    {/* Status indicator */}
                    <div className='absolute top-2 left-2'>
                      {getStatusIcon(photo.status)}
                    </div>

                    {/* Status overlay for uploading */}
                    {photo.status === 'uploading' && (
                      <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                        <div className='bg-black/50 text-white text-xs px-2 py-1 rounded'>
                          {photo.isHeic
                            ? 'Converting & Uploading...'
                            : 'Uploading...'}
                        </div>
                      </div>
                    )}

                    {/* Error message and retry button for failed uploads */}
                    {photo.status === 'failed' && (
                      <div className='absolute inset-0 bg-black/10 flex flex-col items-center justify-center'>
                        <div className='bg-red-500 text-white text-xs px-2 py-1 rounded mb-2'>
                          Upload Failed
                        </div>
                        <Button
                          size='sm'
                          variant='secondary'
                          className='bg-white hover:bg-gray-100 gap-1'
                          onClick={e => {
                            e.stopPropagation();
                            handleRetryUpload(photo.preview);
                          }}
                        >
                          <RefreshCw className='h-3 w-3' />
                          Retry
                        </Button>
                      </div>
                    )}

                    {/* Unsupported file message */}
                    {photo.status === 'unsupported' && (
                      <div className='absolute inset-0 bg-black/10 flex flex-col items-center justify-center'>
                        <div className='bg-amber-500 text-white text-xs px-2 py-1 rounded mb-2'>
                          Unsupported Format
                        </div>
                        <p className='text-xs text-center px-2 bg-white/80 py-1 rounded'>
                          {photo.error || 'This file type is not supported'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove button - disabled during upload */}
                  <button
                    type='button'
                    className={`absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 
                        ${isUploading && photo.status === 'uploading' ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'} 
                        transition-opacity`}
                    onClick={e => {
                      e.stopPropagation();
                      if (!(isUploading && photo.status === 'uploading'))
                        handleRemoveFile(photo.preview);
                    }}
                    disabled={isUploading && photo.status === 'uploading'}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className='space-y-2 mt-4'>
                <div className='w-full bg-muted rounded-full h-2.5'>
                  <div
                    className='bg-primary h-2.5 rounded-full'
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className='text-sm text-center text-muted-foreground'>
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Upload button */}
            <div className='flex justify-end mt-4'>
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  pendingCount === 0 ||
                  photoUploads.every(p => p.status !== 'pending')
                }
                className='gap-2'
              >
                <Upload className='h-4 w-4' />
                {isUploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Photos display section */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className='overflow-hidden'>
              <CardContent className='p-0'>
                <Skeleton className='w-full aspect-square' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg'>
          <p>{error}</p>
        </div>
      ) : photos.length === 0 ? (
        <div className='bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg'>
          <p>No photos found for this event.</p>
          <p className='mt-2'>
            Use the upload area above to add photos to this event.
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold'>
            Event Photos ({photos.length})
          </h2>
          <PhotoGallery photos={photos} alt={event?.title || 'Event'} />
        </div>
      )}
    </div>
  );
}
