"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import type { Venue } from "@/types/venue"

interface VenueSelectorProps {
  venues?: Venue[] // Make venues optional
  value: string
  onChange: (value: string) => void
}

export function VenueSelector({ venues = [], value, onChange }: VenueSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Find the selected venue with null check
  const selectedVenue = venues?.find((venue) => venue.id === value)

  // Filter venues based on search query with null check
  const filteredVenues = venues?.filter((venue) => venue.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          className="w-full justify-between"
          data-testid="venue-selector-trigger"
        >
          {selectedVenue ? selectedVenue.name : "Select a venue..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4" align="start">
        <div className="flex items-center border-b pb-2 mb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            data-testid="venue-search-input"
          />
        </div>

        <div className="max-h-72 overflow-auto py-1" data-testid="venue-options-container">
          {filteredVenues.length === 0 ? (
            <div className="py-6 text-center text-sm">No venue found.</div>
          ) : (
            filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className={cn(
                  "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-accent",
                  value === venue.id && "bg-accent",
                )}
                onClick={() => {
                  onChange(venue.id)
                  setOpen(false)
                }}
                data-testid={`venue-option-${venue.id}`}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-sm overflow-hidden bg-muted">
                  <img
                    src={venue.imageUrl || "/placeholder.svg?height=32&width=32"}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                    }}
                  />
                </div>
                <div className="flex-1 truncate">{venue.name}</div>
                {value === venue.id && <Check className="ml-auto h-4 w-4" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

