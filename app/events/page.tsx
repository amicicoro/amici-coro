"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { EventCard } from "@/components/events/EventCard"
import { EventsHero } from "@/components/events/EventsHero"
import { EventFilters } from "@/components/events/EventFilters"
import type { Event, Venue } from "@/types/event"

export default function EventsPage() {
  const [events, setEvents] = useState<(Event & { venue: Venue })[]>([])
  const [filteredEvents, setFilteredEvents] = useState<(Event & { venue: Venue })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch events")
        }
        return res.json()
      })
      .then((data) => {
        setEvents(data)
        setFilteredEvents(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const handleSearch = (term: string) => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.description?.toLowerCase().includes(term.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }

  const handleSort = (key: "date" | "title" | "venue") => {
    const sorted = [...filteredEvents].sort((a, b) => {
      if (key === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (key === "venue") {
        return a.venue.name.localeCompare(b.venue.name)
      } else {
        return a.title.localeCompare(b.title)
      }
    })
    setFilteredEvents(sorted)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <EventsHero title="Upcoming Events" />

      <main className="flex-1 container mx-auto px-6 sm:px-8 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <EventFilters onSearch={handleSearch} onSort={handleSort} />

          {isLoading ? (
            <p className="text-center text-gray-600">Loading events...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-gray-600">No events found. Please try a different search.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

