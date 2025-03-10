"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { EventCard } from "@/components/events/EventCard"
import { EventFilters } from "@/components/events/EventFilters"
import { EventsHero } from "@/components/events/EventsHero"
import type { Event, Venue } from "@/types/event"

export default function PastEventsPage() {
  const [events, setEvents] = useState<(Event & { venue: Venue })[]>([])
  const [filteredEvents, setFilteredEvents] = useState<(Event & { venue: Venue })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<"date" | "title" | "venue" | null>(null)

  useEffect(() => {
    fetch("/api/past-events")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch past events")
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

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }, [searchQuery, events])

  const handleSort = (key: "date" | "title" | "venue") => {
    setSortKey((prevKey) => {
      const newKey = prevKey === key ? null : key
      if (newKey) {
        const sorted = [...filteredEvents].sort((a, b) => {
          if (newKey === "date") {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          } else if (newKey === "title") {
            return a.title.localeCompare(b.title)
          } else if (newKey === "venue") {
            return a.venue.name.localeCompare(b.venue.name)
          }
          return 0
        })
        setFilteredEvents(sorted)
      }
      return newKey
    })
  }

  const handleSearch = (term: string) => {
    setSearchQuery(term)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <EventsHero title="Past Events" />

      <main className="flex-1 container mx-auto px-6 sm:px-8 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <EventFilters onSearch={handleSearch} onSort={handleSort} />

          {isLoading ? (
            <p className="text-center text-gray-600">Loading past events...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-gray-600">No past events found. Please try a different search.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} isPastEvent={true} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

