"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface PhotoGalleryProps {
  images: string[]
  alt: string
}

export function PhotoGallery({ images, alt }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, index) => (
          <div key={index} className="relative aspect-square cursor-pointer" onClick={() => openLightbox(index)}>
            <Image src={src || "/placeholder.svg"} alt={`${alt} ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white">
            <X size={24} />
          </button>
          <button onClick={goToPrevious} className="absolute left-4 text-white">
            <ChevronLeft size={24} />
          </button>
          <button onClick={goToNext} className="absolute right-4 text-white">
            <ChevronRight size={24} />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${alt} ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

