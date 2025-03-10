"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-gray-700 mb-4 sm:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Learn more
          </Link>
        </p>
        <Button onClick={acceptCookies} className="w-full sm:w-auto">
          Accept
        </Button>
      </div>
    </div>
  )
}

