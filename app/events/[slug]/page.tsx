"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { NotFoundContent } from "@/components/common/NotFoundContent"
import { EventDetails } from "@/components/events/EventDetails"
import type { Event } from "@/types/event"
import { EventHero } from "@/components/events/EventHero"

export default function EventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`)
        if (!res.ok) {
          throw new Error("Failed to fetch event")
        }
        const data = await res.json()
        setEvent(data)
      } catch (err) {
        setError("Failed to load event")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-semibold">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <NotFoundContent
            title="Event Not Found"
            message="We're sorry, but the event you're looking for doesn't exist or has been removed."
            buttonText="View All Events"
            buttonHref="/events"
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <EventHero event={event} venue={event?.venue} />

        <div className="container mx-auto px-6 sm:px-8 md:px-12 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Events
            </Link>

            <EventDetails event={event} isPastEvent={false} />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
