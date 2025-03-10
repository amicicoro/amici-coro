"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoGalleryProps {
  photos: Array<{ src: string; width: number; height: number }>
  alt: string
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null)
  const [visiblePhotos, setVisiblePhotos] = useState<typeof photos>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastPhotoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePhotos()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  useEffect(() => {
    setVisiblePhotos(photos.slice(0, 12))
    setHasMore(photos.length > 12)
  }, [photos])

  const openLightbox = (index: number) => setCurrentPhotoIndex(index)
  const closeLightbox = () => setCurrentPhotoIndex(null)
  const goToPrevious = () =>
    setCurrentPhotoIndex((prev) => (prev === null || prev === 0 ? photos.length - 1 : prev - 1))
  const goToNext = () => setCurrentPhotoIndex((prev) => (prev === null || prev === photos.length - 1 ? 0 : prev + 1))

  const loadMorePhotos = () => {
    setLoading(true)
    setTimeout(() => {
      const currentLength = visiblePhotos.length
      const nextPhotos = photos.slice(currentLength, currentLength + 12)
      setVisiblePhotos((prevPhotos) => [...prevPhotos, ...nextPhotos])
      setHasMore(currentLength + nextPhotos.length < photos.length)
      setLoading(false)
    }, 500)
  }

  return (
    <div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {visiblePhotos.map((photo, index) => (
          <div
            key={index}
            className="mb-4 break-inside-avoid"
            onClick={() => openLightbox(index)}
            ref={index === visiblePhotos.length - 1 ? lastPhotoElementRef : null}
          >
            <div className="relative cursor-pointer overflow-hidden rounded-lg">
              <Image
                src={photo.src || "/placeholder.svg"}
                alt={`${alt} ${index + 1}`}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading more photos...</p>
        </div>
      )}

      {currentPhotoIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] mx-auto">
            <Image
              src={photos[currentPhotoIndex].src || "/placeholder.svg"}
              alt={`${alt} ${currentPhotoIndex + 1}`}
              width={photos[currentPhotoIndex].width}
              height={photos[currentPhotoIndex].height}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}

