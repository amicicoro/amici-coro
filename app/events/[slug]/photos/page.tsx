"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, X, ZoomIn, LayoutDashboard } from "lucide-react"

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
        setPhotos(data)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-0 relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={`Event photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent
                className="max-w-4xl p-0 bg-transparent border-none"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 text-white hover:bg-black/70 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </div>
                  <div className="relative h-[80vh] max-h-[80vh] w-full">
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )
}

