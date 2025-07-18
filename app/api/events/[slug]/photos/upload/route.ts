import { NextResponse } from 'next/server';

import { uploadEventPhoto } from '@/lib/events-data-cloudinary';

export const runtime = 'nodejs'; // Change from edge to nodejs for Cloudinary

// List of supported image MIME types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'application/octet-stream', // Some browsers send HEIC files with this MIME type
];

export async function POST(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;

  try {
    // Check for auth token
    const authToken = request.headers.get('X-Admin-Auth-Token');
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(
      `API: Received file upload request for ${file.name}, type: ${file.type}, size: ${file.size} bytes`,
    );

    // Simplify the file type check
    // Check if the file type is supported
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      console.log(`API: Unsupported file type: ${file.type || 'unknown'}`);
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type || 'unknown'}. Only JPEG, PNG, GIF, WebP, SVG, and HEIC are supported.`,
        },
        { status: 400 },
      );
    }

    // Upload to Cloudinary using our new function
    const result = await uploadEventPhoto(slug, file);

    console.log(`API: Successfully uploaded file ${file.name} to Cloudinary`);

    // Return the result
    return NextResponse.json({
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
    });
  } catch (error) {
    console.error(
      `API: Error uploading photo for event with slug ${slug}:`,
      error,
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload photo',
      },
      { status: 500 },
    );
  }
}
