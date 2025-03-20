import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real application, you would use a database to store users
// and properly hash passwords
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password123" // This should be an environment variable in production

export async function POST(request: Request) {
  try {
    // Get credentials from URL parameters
    const url = new URL(request.url)
    const username = url.searchParams.get("username")
    const password = url.searchParams.get("password")

    console.log("Login attempt:", { username, password })

    // Validate that we have the required fields
    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check if credentials match - use exact string comparison
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log("Login successful")

      // Set the cookie directly using the cookies() function
      cookies().set({
        name: "admin_authenticated",
        value: "true",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
      })

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Login successful",
      })
    }

    console.log("Invalid credentials")

    // Return error for invalid credentials
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 })
  }
}

