import { NextResponse } from "next/server"
import samplePhotos from "@/data/sample-photos.json"

export async function GET() {
  return NextResponse.json(samplePhotos)
}

