'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createVenue, updateVenue } from '@/actions/venues-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Venue } from '@/types/venue';

interface VenueFormProps {
  venue?: Venue;
  mode?: 'create' | 'edit';
}

export function VenueForm({ venue, mode }: VenueFormProps) {
  const isEdit = mode === 'edit' ? true : mode === 'create' ? false : !!venue;
  const router = useRouter();
  const [name, setName] = useState(venue?.name || '');
  const [address, setAddress] = useState(venue?.address || '');
  const [website, setWebsite] = useState(venue?.website || '');
  const [timezone, setTimezone] = useState(venue?.timezone || 'Europe/London');
  const [imageUrl, setImageUrl] = useState(venue?.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    try {
      if (isEdit && venue) {
        await updateVenue(venue.id, {
          name,
          address,
          website,
          timezone,
          imageUrl,
        });
      } else {
        await createVenue({ name, address, website, timezone, imageUrl });
      }
      router.push('/admin?tab=venues');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save venue');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/venues/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      const data = await response.json();
      setImageUrl(data.url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload image',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='container max-w-xl py-12'>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Venue' : 'Add Venue'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor='website'>Website</Label>
              <Input
                id='website'
                value={website}
                onChange={e => setWebsite(e.target.value)}
                type='url'
              />
            </div>
            <div>
              <Label htmlFor='timezone'>Timezone</Label>
              <Input
                id='timezone'
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <Input
                id='imageUrl'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                required
                className='mb-2'
              />
              {/* Image preview */}
              {imageUrl && (
                <div className='mb-2'>
                  <img
                    src={imageUrl}
                    alt='Venue preview'
                    className='w-32 h-32 object-cover rounded border mb-2'
                  />
                </div>
              )}
              {/* Drop zone and upload button */}
              <div
                className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'} mb-2 relative`}
                onClick={() =>
                  !uploading &&
                  document.getElementById('venue-image-upload')?.click()
                }
                onDragOver={e => {
                  e.preventDefault();
                  if (!uploading)
                    e.currentTarget.classList.add('border-blue-400');
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  if (!uploading)
                    e.currentTarget.classList.remove('border-blue-400');
                }}
                onDrop={async e => {
                  e.preventDefault();
                  if (uploading) return;
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const fakeEvent = {
                      target: { files },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    await handleImageUpload(fakeEvent);
                  }
                }}
                style={{ minHeight: '80px' }}
              >
                {uploading && (
                  <div className='absolute inset-0 bg-white/70 flex items-center justify-center z-10'>
                    <Loader2 className='animate-spin h-6 w-6 text-blue-500' />
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  id='venue-image-upload'
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className='flex flex-col items-center justify-center h-full'>
                  <span className='text-sm text-muted-foreground'>
                    Drag and drop an image here, or click to select
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={e => {
                      e.stopPropagation();
                      document.getElementById('venue-image-upload')?.click();
                    }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className='animate-spin h-4 w-4 mr-2' />
                        Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </Button>
                </div>
              </div>
              {uploadError && (
                <div className='text-xs text-red-600 mt-1'>{uploadError}</div>
              )}
            </div>
            {formError && <div className='text-red-600'>{formError}</div>}
            <div className='flex gap-2'>
              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Venue'}
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full'
                type='button'
              >
                <Link href='/admin?tab=venues'>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
