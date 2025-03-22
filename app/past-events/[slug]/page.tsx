"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { NotFoundContent } from "@/components/common/NotFoundContent"
import { EventDetails } from "@/components/events/EventDetails"
import { PhotoGallery } from "@/components/photo-gallery"
import type { Event } from "@/types/event"
import { EventHero } from "@/components/events/EventHero"

export default function PastEventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Separate state for photos
  const [photos, setPhotos] = useState<string[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photosError, setPhotosError] = useState<string | null>(null)

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/past-events/${slug}`)
        if (!response.ok) {
          throw new Error("Failed to fetch past event")
        }
        const data = await response.json()
        setEvent(data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  // Fetch photos independently
  useEffect(() => {
    const fetchPhotos = async () => {
      setPhotosLoading(true)
      try {
        const response = await fetch(`/api/events/${slug}/photos`)
        if (!response.ok) {
          throw new Error("Failed to fetch photos")
        }
        const data = await response.json()
        setPhotos(data.photos) // The API returns objects with url property
        setPhotosLoading(false)
      } catch (err) {
        setPhotosError(err instanceof Error ? err.message : "An error occurred")
        setPhotosLoading(false)
      }
    }

    if (event) {
      fetchPhotos()
    }
  }, [slug, event])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-600">Loading past event...</p>
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
            title="Past Event Not Found"
            message="We're sorry, but the past event you're looking for doesn't exist or has been removed."
            buttonText="View All Past Events"
            buttonHref="/past-events"
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
        <EventHero event={event} venue={event?.venue} isPastEvent={true} />

        <div className="container mx-auto px-6 sm:px-8 md:px-12 py-12">
          <div className="max-w-6xl mx-auto">
            <Link href="/past-events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Past Events
            </Link>

            <EventDetails event={event} isPastEvent={true} />

            {/* Photo Gallery Section - Only shown if photos exist */}
            {photosLoading ? (
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 mb-8">
                  <Camera className="w-6 h-6" />
                  <span>Event Gallery</span>
                </h2>
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading photos...</p>
                </div>
              </div>
            ) : photosError ? (
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 mb-8">
                  <Camera className="w-6 h-6" />
                  <span>Event Gallery</span>
                </h2>
                <div className="text-center py-12">
                  <p className="text-red-500">{photosError}</p>
                </div>
              </div>
            ) : photos.length > 0 ? (
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 mb-8">
                  <Camera className="w-6 h-6" />
                  <span>Event Gallery</span>
                </h2>
                <PhotoGallery photos={photos} alt={event.title} />
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

