'use client';

import type React from 'react';

import { createEvent, updateEvent } from '@/actions/event-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Event, MusicItem, ScheduleItem } from '@/types/event';
import type { Venue } from '@/types/venue';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2, Plus, Calendar, Music, Upload } from 'lucide-react';

interface EventFormProps {
  event?: Event;
  venues: Venue[];
  mode?: 'create' | 'edit';
}

export function EventForm({ event, venues, mode = 'create' }: EventFormProps) {
  const isEdit = mode === 'edit' && !!event;
  const router = useRouter();
  const [title, setTitle] = useState(event?.title || '');
  const [subtitle, setSubtitle] = useState(event?.subtitle || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [endDate, setEndDate] = useState(event?.endDate || '');
  const [venueId, setVenueId] = useState(
    event?.venueId || (venues[0]?.id ?? ''),
  );
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    event?.schedule || [],
  );
  const [musicList, setMusicList] = useState<{ [key: string]: MusicItem[] }>(
    event?.musicList || {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image upload handler (optional, as in VenueForm)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/events/upload-image', {
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

  // Schedule handlers
  const addScheduleItem = () =>
    setSchedule([...schedule, { date: '', startTime: '', description: '' }]);
  const removeScheduleItem = (idx: number) =>
    setSchedule(schedule.filter((_, i) => i !== idx));
  const updateScheduleItem = (
    idx: number,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    setSchedule(
      schedule.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    );
  };

  // MusicList handlers
  const addMusicService = () => {
    const newKey = prompt('Service name (e.g. Sunday Evensong)')?.trim();
    if (newKey && !musicList[newKey]) {
      setMusicList({ ...musicList, [newKey]: [] });
    }
  };
  const removeMusicService = (key: string) => {
    const newList = { ...musicList };
    delete newList[key];
    setMusicList(newList);
  };
  const addMusicItem = (key: string) => {
    setMusicList({
      ...musicList,
      [key]: [...(musicList[key] || []), { title: '', composer: '', type: '' }],
    });
  };
  const removeMusicItem = (key: string, idx: number) => {
    setMusicList({
      ...musicList,
      [key]: musicList[key].filter((_, i) => i !== idx),
    });
  };
  const updateMusicItem = (
    key: string,
    idx: number,
    field: keyof MusicItem,
    value: string,
  ) => {
    setMusicList({
      ...musicList,
      [key]: musicList[key].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    try {
      const eventSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      const eventData: Omit<Event, 'id'> = {
        slug: eventSlug,
        title,
        subtitle,
        description,
        startDate,
        endDate,
        venueId,
        imageUrl,
        schedule,
        musicList,
      };
      if (isEdit && event) {
        await updateEvent(event.id, eventData);
      } else {
        await createEvent(eventData);
      }
      router.push('/admin/events');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container max-w-2xl py-12'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {isEdit ? 'Edit Event' : 'Add Event'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Basic Information
              </h3>
              <div>
                <Label htmlFor='title'>Title</Label>
                <Input
                  id='title'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor='subtitle'>Subtitle</Label>
                <Input
                  id='subtitle'
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Date and Venue Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground'>
                Date & Venue
              </h3>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <Label htmlFor='startDate'>Start Date</Label>
                  <Input
                    id='startDate'
                    type='date'
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className='flex-1'>
                  <Label htmlFor='endDate'>End Date</Label>
                  <Input
                    id='endDate'
                    type='date'
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='venueId'>Venue</Label>
                <select
                  id='venueId'
                  value={venueId}
                  onChange={e => setVenueId(e.target.value)}
                  required
                  className='w-full border rounded px-3 py-2 bg-background'
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            {/* Image Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                Event Image
              </h3>
              <div>
                <Label htmlFor='imageUrl'>Image URL</Label>
                <Input
                  id='imageUrl'
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className='mb-2'
                />
                {imageUrl && (
                  <div className='mb-2'>
                    <img
                      src={imageUrl || '/placeholder.svg'}
                      alt='Event preview'
                      className='w-32 h-32 object-cover rounded border mb-2'
                    />
                  </div>
                )}
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'} mb-2 relative`}
                  onClick={() =>
                    !uploading &&
                    document.getElementById('event-image-upload')?.click()
                  }
                  onDragOver={e => {
                    e.preventDefault();
                    if (!uploading)
                      e.currentTarget.classList.add('border-primary');
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    if (!uploading)
                      e.currentTarget.classList.remove('border-primary');
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
                    <div className='absolute inset-0 bg-background/70 flex items-center justify-center z-10'>
                      <span className='animate-spin h-6 w-6 text-primary'>
                        Uploading...
                      </span>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    id='event-image-upload'
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <div className='flex flex-col items-center justify-center h-full'>
                    <Upload className='h-8 w-8 text-muted-foreground mb-2' />
                    <span className='text-sm text-muted-foreground'>
                      Drag and drop an image here, or click to select
                    </span>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='mt-2 bg-transparent'
                      onClick={e => {
                        e.stopPropagation();
                        document.getElementById('event-image-upload')?.click();
                      }}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                </div>
                {imageUrl && (
                  <a
                    href={imageUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-primary underline'
                  >
                    View Image
                  </a>
                )}
                {uploadError && (
                  <div className='text-xs text-muted-foreground mt-1'>
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Schedule Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Schedule
                </h3>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addScheduleItem}
                  className='flex items-center gap-2 bg-transparent'
                >
                  <Plus className='h-4 w-4' />
                  Add Schedule Item
                </Button>
              </div>
              {schedule.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No schedule items added yet.
                </p>
              ) : (
                <div className='space-y-3'>
                  {schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className='flex gap-2 items-end p-3 border rounded-lg bg-muted/20'
                    >
                      <div className='flex-1'>
                        <Label className='text-xs'>Date</Label>
                        <Input
                          type='date'
                          value={item.date}
                          onChange={e =>
                            updateScheduleItem(idx, 'date', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className='flex-1'>
                        <Label className='text-xs'>Time</Label>
                        <Input
                          type='time'
                          value={item.startTime || ''}
                          onChange={e =>
                            updateScheduleItem(idx, 'startTime', e.target.value)
                          }
                        />
                      </div>
                      <div className='flex-2'>
                        <Label className='text-xs'>Description</Label>
                        <Input
                          value={item.description}
                          onChange={e =>
                            updateScheduleItem(
                              idx,
                              'description',
                              e.target.value,
                            )
                          }
                          placeholder='Description'
                          required
                        />
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => removeScheduleItem(idx)}
                        className='shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border-gray-200'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Music List Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                  <Music className='h-5 w-5' />
                  Music List
                </h3>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addMusicService}
                  className='flex items-center gap-2 bg-transparent'
                >
                  <Plus className='h-4 w-4' />
                  Add Music Service
                </Button>
              </div>
              {Object.keys(musicList).length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No music services added yet.
                </p>
              ) : (
                <div className='space-y-4'>
                  {Object.entries(musicList).map(([service, items]) => (
                    <div
                      key={service}
                      className='border rounded-lg p-4 bg-muted/10'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-medium text-foreground'>
                          {service}
                        </h4>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => addMusicItem(service)}
                            className='flex items-center gap-1'
                          >
                            <Plus className='h-3 w-3' />
                            Add Item
                          </Button>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => removeMusicService(service)}
                            className='flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border-gray-200'
                          >
                            <Trash2 className='h-3 w-3' />
                            Remove Service
                          </Button>
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <p className='text-muted-foreground text-sm'>
                          No music items in this service.
                        </p>
                      ) : (
                        <div className='space-y-2'>
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className='flex gap-2 items-end p-2 border rounded bg-background'
                            >
                              <div className='flex-1'>
                                <Label className='text-xs'>Title</Label>
                                <Input
                                  value={item.title}
                                  onChange={e =>
                                    updateMusicItem(
                                      service,
                                      idx,
                                      'title',
                                      e.target.value,
                                    )
                                  }
                                  placeholder='Title'
                                  required
                                />
                              </div>
                              <div className='flex-1'>
                                <Label className='text-xs'>Composer</Label>
                                <Input
                                  value={item.composer || ''}
                                  onChange={e =>
                                    updateMusicItem(
                                      service,
                                      idx,
                                      'composer',
                                      e.target.value,
                                    )
                                  }
                                  placeholder='Composer'
                                />
                              </div>
                              <div className='flex-1'>
                                <Label className='text-xs'>Type</Label>
                                <Input
                                  value={item.type || ''}
                                  onChange={e =>
                                    updateMusicItem(
                                      service,
                                      idx,
                                      'type',
                                      e.target.value,
                                    )
                                  }
                                  placeholder='Type'
                                />
                              </div>
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() => removeMusicItem(service, idx)}
                                className='shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border-gray-200'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Form Actions */}
            {formError && (
              <div className='text-muted-foreground bg-muted/20 p-3 rounded border'>
                {formError}
              </div>
            )}
            <div className='flex gap-2'>
              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Event'}
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <a href='/admin?tab=events'>Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
