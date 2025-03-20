"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// In a real application, you would use a database to store users
// and properly hash passwords
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password123"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Validate credentials
  if (!username || !password) {
    return { success: false, error: "Username and password are required" }
  }

  // Check if credentials match
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set the authentication cookie
    cookies().set({
      name: "admin_authenticated",
      value: "true",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Return success
    return { success: true }
  }

  // Invalid credentials
  return { success: false, error: "Invalid username or password" }
}

export async function logout() {
  // Clear the authentication cookie
  cookies().set({
    name: "admin_authenticated",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Expire immediately
  })

  // Redirect to login page
  redirect("/login")
}

export async function checkAuth() {
  // Check if the user is authenticated
  const isAdmin = cookies().get("admin_authenticated")?.value === "true"

  // Return the authentication status
  return { authenticated: isAdmin }
}

