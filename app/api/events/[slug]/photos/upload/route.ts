import { NextResponse } from "next/server"
import { uploadEventPhoto } from "@/lib/events-data"

export const runtime = "edge"

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    // Check for auth token
    const authToken = request.headers.get("X-Admin-Auth-Token")
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Use the centralized function to upload the photo
    const result = await uploadEventPhoto(slug, file)

    // Return the blob URL and metadata
    return NextResponse.json(result)
  } catch (error) {
    console.error(`API: Error uploading photo for event with slug ${slug}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload photo" },
      { status: 500 },
    )
  }
}

