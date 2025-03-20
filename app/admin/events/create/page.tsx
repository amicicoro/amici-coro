"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateEventForm from "./create-event-form"

export default function CreateEventPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if authenticated
    const token = localStorage.getItem("adminAuthToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This should never render as we redirect in useEffect
  }

  return <CreateEventForm />
}

