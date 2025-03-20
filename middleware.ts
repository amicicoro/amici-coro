import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only protect API routes that modify data
  const path = request.nextUrl.pathname

  // Skip authentication for GET requests and auth-related routes
  if (request.method === "GET" || path.startsWith("/api/auth/")) {
    return NextResponse.next()
  }

  // For POST/PUT/DELETE requests to /api/events, check for auth header
  if (path.startsWith("/api/events")) {
    const authHeader = request.headers.get("X-Admin-Auth-Token")

    // In a real app, you would validate this token properly
    // For now, just check if it exists
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

// Configure the paths that should be checked by this middleware
export const config = {
  matcher: ["/api/events/:path*"],
}

