import { NextResponse } from "next/server"
import { getFromCache, setCache } from "@/lib/redis-client"

export async function GET() {
  try {
    // Generate a test key with timestamp
    const testKey = `test-redis-${Date.now()}`
    const testValue = { message: "Redis is working!", timestamp: new Date().toISOString() }

    // Try to set the value in Redis
    console.log(`Testing Redis with key: ${testKey}`)
    const setResult = await setCache(testKey, testValue, 60) // 60 second TTL

    if (!setResult) {
      throw new Error("Failed to set value in Redis")
    }

    // Try to get the value back from Redis
    const cachedValue = await getFromCache(testKey)

    if (!cachedValue) {
      throw new Error("Failed to get value from Redis")
    }

    // Return success response with both values for comparison
    return NextResponse.json({
      success: true,
      original: testValue,
      fromCache: cachedValue,
      match: JSON.stringify(testValue) === JSON.stringify(cachedValue),
    })
  } catch (error) {
    console.error("Redis test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
