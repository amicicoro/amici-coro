'use client';

import { Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface EventFiltersProps {
  onSearch: (term: string) => void;
  onSort: (key: 'date' | 'title' | 'venue') => void;
}

export function EventFilters({ onSearch, onSort }: EventFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
      <form onSubmit={handleSearch} className='relative w-full md:w-auto'>
        <input
          type='text'
          placeholder='Search events...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10 pr-4 py-2 border rounded-md w-full md:w-64'
        />
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
        <Button
          type='submit'
          className='absolute right-2 top-1/2 transform -translate-y-1/2'
        >
          Search
        </Button>
      </form>
      <div className='flex gap-2'>
        <Button onClick={() => onSort('date')} variant='outline'>
          Sort by Date
        </Button>
        <Button onClick={() => onSort('title')} variant='outline'>
          Sort by Title
        </Button>
        <Button onClick={() => onSort('venue')} variant='outline'>
          Sort by Venue
        </Button>
      </div>
    </div>
  );
}
