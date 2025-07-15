import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Venue } from '@/types/venue';

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  console.log(venue);
  return (
    <Card className='overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200'>
      <div className='aspect-video bg-muted relative overflow-hidden'>
        <Image
          src={venue.imageUrl || '/placeholder.svg?height=200&width=400'}
          alt={venue.name}
          width={400}
          height={225}
          className='object-cover w-full h-full'
        />
      </div>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl'>{venue.name}</CardTitle>
        <CardDescription className='line-clamp-1'>
          {venue.address}
        </CardDescription>
      </CardHeader>
      <CardFooter className='flex justify-between pt-0'>
        {venue.website && (
          <Button variant='outline' size='sm' asChild className='gap-1'>
            <a href={venue.website} target='_blank' rel='noopener noreferrer'>
              Website <ExternalLink className='h-3 w-3' />
            </a>
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button variant='outline' size='sm' asChild className='gap-1'>
                  <Link href={`/admin/venues/edit/${venue.id}`}>Edit</Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit functionality coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
