import { NextResponse } from 'next/server';

import { getVenueFolderPath, uploadToCloudinary } from '@/lib/cloudinary';
// Import your admin middleware if needed

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Optionally, check admin auth here if not handled by middleware
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const folder = getVenueFolderPath();
    const result = await uploadToCloudinary(file, folder);
    return NextResponse.json({ url: result.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload image' },
      { status: 500 },
    );
  }
}
