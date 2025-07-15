'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAllVenues } from '@/actions/venues-actions';
import { ErrorMessage } from '@/components/admin/error-message';
import { VenueCard } from '@/components/admin/venue-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Venue } from '@/types/venue';

export const VenuesPanel = () => {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesError, setVenuesError] = useState<string | null>(null);

  // Fetch venues data
  useEffect(() => {
    fetchVenuesData();
  }, []);

  const fetchVenuesData = async () => {
    setIsLoading(true);

    try {
      // Fetch venues using the server action
      const venuesData = await getAllVenues();
      setVenues(venuesData);
    } catch (err) {
      console.error('Error loading venues:', err);
      setVenuesError('Failed to load venues. Please try again later.');
    }

    setIsLoading(false);
  };

  // For venues, we'll show 12 per page (4 rows of 3 columns)
  const venuesPerPage = 12;
  const totalVenuePages = Math.ceil(venues.length / venuesPerPage);

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * venuesPerPage;
  const endIndex = startIndex + venuesPerPage;

  // Get the venues for the current page
  const currentPageVenues = venues.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Loading venues...</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>Venues Management</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button size='default' className='gap-2' asChild>
                  <Link href='/admin/venues/create'>
                    <Plus className='h-4 w-4' /> Create Venue
                  </Link>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Venue creation coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ErrorMessage message={venuesError} />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {!venuesError && venues.length === 0 ? (
          <Card className='shadow-md md:col-span-2 lg:col-span-3'>
            <CardContent className='pt-10 pb-10'>
              <p className='text-center text-muted-foreground text-lg'>
                No venues found.
              </p>
            </CardContent>
          </Card>
        ) : (
          currentPageVenues.map(venue => (
            <VenueCard key={venue.id} venue={venue} />
          ))
        )}
      </div>

      {venues.length > venuesPerPage && (
        <div className='mt-8'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? `/admin?tab=venues&page=${currentPage - 1}`
                      : '#'
                  }
                  className={
                    currentPage <= 1 ? 'cursor-not-allowed opacity-50' : ''
                  }
                />
              </PaginationItem>

              {/* Generate page links */}
              {Array.from({ length: Math.min(5, totalVenuePages) }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  // For more than 5 pages, show ellipsis
                  if (totalVenuePages > 5 && index === 4) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <span className='px-2'>...</span>
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={`/admin?tab=venues&page=${pageNumber}`}
                        isActive={pageNumber === currentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

              {/* Show last page if there are more than 5 pages and we're not on the last page */}
              {totalVenuePages > 5 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/admin?tab=venues&page=${totalVenuePages}`}
                    isActive={totalVenuePages === currentPage}
                  >
                    {totalVenuePages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < totalVenuePages
                      ? `/admin?tab=venues&page=${currentPage + 1}`
                      : '#'
                  }
                  className={
                    currentPage >= totalVenuePages
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className='text-center text-sm text-muted-foreground mt-2'>
            Showing {startIndex + 1}-{Math.min(endIndex, venues.length)} of{' '}
            {venues.length} venues
          </p>
        </div>
      )}
    </>
  );
};
