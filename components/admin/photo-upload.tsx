"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, X, ImageIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface PhotoUploadProps {
  slug: string
  onUploadComplete: () => void
}

interface PhotoPreview {
  file: File
  preview: string
  status: "pending" | "uploading" | "completed" | "failed"
  error?: string
}

export function PhotoUpload({ slug, onUploadComplete }: PhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    // Create photo previews with pending status
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }))

    setPhotos((prev) => [...prev, ...newPhotos])
  }

  const handleUpload = async () => {
    if (photos.length === 0 || photos.every((p) => p.status === "completed")) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Get the admin auth token
      const token = localStorage.getItem("adminAuthToken")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Get all pending photos
      const pendingPhotos = photos.filter((p) => p.status === "pending")
      const totalToUpload = pendingPhotos.length
      let completed = 0

      // Set all pending photos to uploading status
      setPhotos((prev) => prev.map((p) => (p.status === "pending" ? { ...p, status: "uploading" } : p)))

      // Create an array of promises for parallel uploads
      const uploadPromises = pendingPhotos.map(async (photo, index) => {
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
          setPhotos((prev) => prev.map((p) => (p.preview === photo.preview ? { ...p, status: "completed" } : p)))

          // Update progress
          completed++
          setUploadProgress(Math.round((completed / totalToUpload) * 100))

          return { success: true, preview: photo.preview }
        } catch (err) {
          // Update status to failed
          setPhotos((prev) =>
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

      // Notify parent component
      onUploadComplete()
    } catch (err) {
      console.error("Error uploading photos:", err)
      setError(err instanceof Error ? err.message : "Failed to upload photos")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (preview: string) => {
    // Find the photo
    const photo = photos.find((p) => p.preview === preview)
    if (!photo) return

    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photo.preview)

    // Remove the photo
    setPhotos((prev) => prev.filter((p) => p.preview !== preview))
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

    setPhotos((prev) => [...prev, ...newPhotos])
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

  const pendingCount = photos.filter((p) => p.status === "pending").length
  const completedCount = photos.filter((p) => p.status === "completed").length
  const failedCount = photos.filter((p) => p.status === "failed").length

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if not currently uploading
        if (isUploading && !open) return
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          {/* File input */}
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"} transition-colors`}
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
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isUploading ? "Upload in progress..." : "Drag and drop photos here, or click to select files"}
            </p>
          </div>

          {/* Upload stats */}
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Total: {photos.length}</span>
              {pendingCount > 0 && <span>• Pending: {pendingCount}</span>}
              {completedCount > 0 && <span>• Completed: {completedCount}</span>}
              {failedCount > 0 && <span className="text-red-500">• Failed: {failedCount}</span>}
            </div>
          )}

          {/* Preview selected files */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pb-4">
              {photos.map((photo, index) => (
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
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-auto">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isUploading}>
            {photos.every((p) => p.status === "completed" || p.status === "failed") ? "Close" : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || photos.length === 0 || photos.every((p) => p.status === "completed")}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

