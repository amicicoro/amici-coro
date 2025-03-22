"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  X,
  ZoomIn,
  LayoutDashboard,
  ImageIcon,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface Photo {
  url: string
  pathname: string
  contentType: string
}

interface PhotoPreview {
  file: File
  preview: string
  status: "pending" | "uploading" | "completed" | "failed"
  error?: string
}

export default function AdminEventPhotosPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [event, setEvent] = useState<any>(null)

  // Upload state
  const [photoUploads, setPhotoUploads] = useState<PhotoPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAdmin(true)
      fetchPhotos()
    }
  }, [router, slug])

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

      // Fix: Extract the photos array from the response
      if (data && data.photos && Array.isArray(data.photos)) {
        setPhotos(data.photos)
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

  const handleBackClick = () => {
    router.back()
  }

  // Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    // Create photo previews with pending status
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }))

    setPhotoUploads((prev) => [...prev, ...newPhotos])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    const files = Array.from(e.dataTransfer.files)

    // Create photo previews with pending status
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }))

    setPhotoUploads((prev) => [...prev, ...newPhotos])
  }

  const handleRemoveFile = (preview: string) => {
    // Find the photo
    const photo = photoUploads.find((p) => p.preview === preview)
    if (!photo) return

    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photo.preview)

    // Remove the photo
    setPhotoUploads((prev) => prev.filter((p) => p.preview !== preview))
  }

  const handleUpload = async () => {
    if (photoUploads.length === 0 || photoUploads.every((p) => p.status === "completed")) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Get the admin auth token
      const token = localStorage.getItem("adminAuthToken")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Get all pending photos
      const pendingPhotos = photoUploads.filter((p) => p.status === "pending")
      const totalToUpload = pendingPhotos.length
      let completed = 0

      // Set all pending photos to uploading status
      setPhotoUploads((prev) => prev.map((p) => (p.status === "pending" ? { ...p, status: "uploading" } : p)))

      // Create an array of promises for parallel uploads
      const uploadPromises = pendingPhotos.map(async (photo) => {
        try {
          // Create a FormData object
          const formData = new FormData()
          formData.append("file", photo.file)

          // Upload the file
          const response = await fetch(`/api/events/${slug}/photos/upload`, {
            method: "POST",
            headers: {
              "X-Admin-Auth-Token": token,
            },
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to upload photo")
          }

          // Update status to completed
          setPhotoUploads((prev) => prev.map((p) => (p.preview === photo.preview ? { ...p, status: "completed" } : p)))

          // Update progress
          completed++
          setUploadProgress(Math.round((completed / totalToUpload) * 100))

          return { success: true, preview: photo.preview }
        } catch (err) {
          // Update status to failed
          setPhotoUploads((prev) =>
            prev.map((p) =>
              p.preview === photo.preview
                ? {
                    ...p,
                    status: "failed",
                    error: err instanceof Error ? err.message : "Upload failed",
                  }
                : p,
            ),
          )

          // Update progress even for failures
          completed++
          setUploadProgress(Math.round((completed / totalToUpload) * 100))

          return { success: false, preview: photo.preview, error: err }
        }
      })

      // Wait for all uploads to complete (in parallel)
      await Promise.all(uploadPromises)

      // Refresh photos
      fetchPhotos()
    } catch (err) {
      console.error("Error uploading photos:", err)
      setUploadError(err instanceof Error ? err.message : "Failed to upload photos")
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-white" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const pendingCount = photoUploads.filter((p) => p.status === "pending").length
  const completedCount = photoUploads.filter((p) => p.status === "completed").length
  const failedCount = photoUploads.filter((p) => p.status === "failed").length

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

        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Always show upload box at the top */}
      {isAdmin && (
        <div className="mb-8 border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{uploadError}</div>
          )}

          {/* File input area */}
          <div
            className={`border-2 border-dashed rounded-md p-8 text-center ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"} transition-colors`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={!isUploading ? handleDrop : undefined}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isUploading}
            />
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              {isUploading ? "Upload in progress..." : "Drag and drop photos here, or click to select files"}
            </p>
          </div>

          {/* Upload stats */}
          {photoUploads.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-4">
              <span>Total: {photoUploads.length}</span>
              {pendingCount > 0 && <span>• Pending: {pendingCount}</span>}
              {completedCount > 0 && <span>• Completed: {completedCount}</span>}
              {failedCount > 0 && <span className="text-red-500">• Failed: {failedCount}</span>}
            </div>
          )}

          {/* Preview selected files */}
          {photoUploads.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photoUploads.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`relative aspect-square rounded-md overflow-hidden ${photo.status === "failed" ? "opacity-50" : ""}`}
                    >
                      <Image
                        src={photo.preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Status indicator */}
                      <div className="absolute top-2 left-2">{getStatusIcon(photo.status)}</div>

                      {/* Status overlay for uploading */}
                      {photo.status === "uploading" && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">Uploading...</div>
                        </div>
                      )}

                      {/* Error message for failed uploads */}
                      {photo.status === "failed" && photo.error && (
                        <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white text-xs px-2 py-1">
                          {photo.error.length > 20 ? photo.error.substring(0, 20) + "..." : photo.error}
                        </div>
                      )}
                    </div>

                    {/* Remove button - disabled during upload */}
                    <button
                      type="button"
                      className={`absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 
                        ${isUploading ? "opacity-50 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"} 
                        transition-opacity`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isUploading) handleRemoveFile(photo.preview)
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="space-y-2 mt-4">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {/* Upload button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={
                    isUploading || photoUploads.length === 0 || photoUploads.every((p) => p.status === "completed")
                  }
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
          <p className="mt-2">Use the upload area above to add photos to this event.</p>
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

