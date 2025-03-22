"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { PhotoGallery } from "@/components/photo-gallery"

interface Photo {
  url: string
  pathname: string
  contentType: string
}

export default function EventPhotosPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [fitMode, setFitMode] = useState<"cover" | "contain">("contain")

  useEffect(() => {
    // Check if user is admin (for admin dashboard link)
    const token = localStorage.getItem("adminAuthToken")
    setIsAdmin(!!token)

    // Fetch photos for the event - no authentication required
    const fetchPhotos = async () => {
      try {
        setIsLoading(true)

        // Fetch event details
        const eventResponse = await fetch(`/api/events/${slug}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEvent(eventData)
        }

        // Fetch photos
        const response = await fetch(`/api/events/${slug}/photos`)

        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API response:", data) // Debug log

        // Fix: Extract the photos array from the response
        if (data && data.photos && Array.isArray(data.photos)) {
          setPhotos(data.photos)
          console.log("Photos set:", data.photos) // Debug log
        } else {
          console.error("Unexpected photos data format:", data)
          setPhotos([])
        }
      } catch (err) {
        console.error("Error fetching photos:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch photos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhotos()
  }, [slug])

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="container max-w-6xl py-12">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Event Photos</h1>
            {event && <p className="text-muted-foreground mt-1">{event.title}</p>}
          </div>
        </div>

        {isAdmin && (
          <Button variant="outline" asChild className="gap-2">
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full aspect-square" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg">
          <p>No photos found for this event.</p>
        </div>
      ) : (
        <PhotoGallery photos={photos} alt={event?.title || "Event"} />
      )}
    </div>
  )
}

