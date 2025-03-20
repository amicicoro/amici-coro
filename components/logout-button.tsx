"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth token from localStorage
    localStorage.removeItem("adminAuthToken")

    // Redirect to login page
    router.push("/login")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}

