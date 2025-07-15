// This file contains Cloudinary-specific utilities
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to generate a folder path for events
export function getEventFolderPath(slug: string): string {
  return `amici-coro/events/${slug}/photos`;
}

// Helper function to generate a folder path for events
export function getVenueFolderPath(): string {
  return 'amici-coro/venues/images';
}

// Upload a file to Cloudinary
export async function uploadToCloudinary(
  file: File | Buffer,
  folder: string,
  publicId?: string,
): Promise<{ url: string; publicId: string; format: string }> {
  try {
    // For client-side File objects, we need to convert to a buffer or base64
    let uploadResult;

    if (typeof Buffer !== 'undefined' && file instanceof Buffer) {
      // Server-side upload with buffer
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        uploadStream.end(file);
      });
    } else if (typeof File !== 'undefined' && file instanceof File) {
      // Client-side upload with File object
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload using buffer
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        uploadStream.end(buffer);
      });
    } else {
      throw new Error('Unsupported file type');
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// List all images in a folder
export async function listImagesInFolder(
  folder: string,
): Promise<Array<{ url: string; publicId: string; format: string }>> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500,
      resource_type: 'image',
    });

    return result.resources.map(resource => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      format: resource.format,
    }));
  } catch (error) {
    console.error('Error listing Cloudinary images:', error);
    throw error;
  }
}

// Delete an image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
