import { NextResponse } from "next/server"
import { getCacheStats, resetStats } from "@/lib/cache-stats"

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url)
  const reset = searchParams.get("reset") === "true"

  if (reset) {
    resetStats()
    return NextResponse.json({ message: "Cache statistics reset" })
  }

  return NextResponse.json(getCacheStats())
}
