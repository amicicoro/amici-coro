import {
  getEventFolderPath,
  uploadToCloudinary,
  listImagesInFolder,
} from './cloudinary';

// Base implementation without caching
export async function _getEventPhotos(
  slug: string,
): Promise<{ url: string; pathname: string; contentType: string }[]> {
  try {
    console.log(`Fetching photos for event: ${slug}`);

    // Get the Cloudinary folder path for this event
    const folderPath = getEventFolderPath(slug);

    // List all images in the folder
    const images = await listImagesInFolder(folderPath);

    console.log(`Found ${images.length} photos for event ID: ${slug}`);

    // Convert to the format expected by the existing code
    const photos = images.map(image => ({
      url: image.url,
      pathname: image.publicId, // Store the publicId in pathname for future reference
      contentType: `image/${image.format}`,
    }));

    return photos;
  } catch (error) {
    console.error(`Error fetching photos for event ${slug}:`, error);
    throw error;
  }
}

// Apply caching decorator to the base implementation
export async function getEventPhotos(
  slug: string,
): Promise<{ url: string; pathname: string; contentType: string }[]> {
  try {
    // Dynamically import the cache-decorator module
    const { createCachedFunction } = await import('./cache-decorator');
    const CACHE_TTL = { PHOTOS: 60 * 60 * 24 * 14 }; // 14 days
    const CACHE_KEYS = {
      EVENT_PHOTOS: (slug: string) => `events:${slug}:photos`,
    };

    // Create a cached version of the function
    const cachedFn = createCachedFunction(
      _getEventPhotos,
      'photos',
      CACHE_TTL.PHOTOS,
      (slug: string) => slug,
    );

    // Call the cached function
    return await cachedFn(slug);
  } catch (error) {
    console.error('Error in getEventPhotos:', error);
    throw error;
  }
}

// Update the uploadEventPhoto function to remove HEIC-specific handling
export async function uploadEventPhoto(
  slug: string,
  file: File,
): Promise<{ url: string; pathname: string; contentType: string }> {
  try {
    console.log(`Uploading photo for event with slug: ${slug}`);

    // Generate a unique filename using timestamp
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const uniqueFileName = `${timestamp}-${sanitizedFilename}`;

    // Get the Cloudinary folder path for this event
    const folderPath = getEventFolderPath(slug);

    // Upload the file to Cloudinary
    const result = await uploadToCloudinary(file, folderPath);

    console.log(`Successfully uploaded photo for event ${slug}: ${result.url}`);

    // Dynamically import the cache-decorator module
    const { invalidateCache } = await import('./cache-decorator');
    const CACHE_KEYS = {
      EVENT_PHOTOS: (slug: string) => `events:${slug}:photos`,
    };

    // Invalidate the photos cache for this event
    await invalidateCache(CACHE_KEYS.EVENT_PHOTOS(slug));

    // Return the result in the format expected by the existing code
    return {
      url: result.url,
      pathname: result.publicId, // Store the publicId in pathname for future reference
      contentType: `image/${result.format}`,
    };
  } catch (error) {
    console.error(`Error uploading photo for event ${slug}:`, error);
    throw error;
  }
}
