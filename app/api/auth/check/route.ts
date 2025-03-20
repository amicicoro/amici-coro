import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the auth token from the header
  const authToken = request.headers.get("X-Admin-Auth-Token")

  // In a real app, you would validate this token properly
  // For now, just check if it exists
  const isAuthenticated = !!authToken

  return NextResponse.json({ authenticated: isAuthenticated })
}

