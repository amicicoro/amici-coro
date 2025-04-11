import "server-only"

// Simple in-memory cache implementation as a fallback when Redis is not available
const cache = new Map<string, { value: any; expiry: number }>()

/**
 * Get a value from the in-memory cache
 * @param key The cache key
 * @returns The cached value or null if not found or expired
 */
export function getFromMemoryCache<T>(key: string): T | null {
  const item = cache.get(key)

  // Return null if item doesn't exist
  if (!item) return null

  // Check if item has expired
  if (item.expiry < Date.now()) {
    cache.delete(key)
    return null
  }

  return item.value as T
}

/**
 * Set a value in the in-memory cache with optional TTL
 * @param key The cache key
 * @param value The value to cache
 * @param ttl Time to live in seconds (optional)
 * @returns true if successful
 */
export function setMemoryCache(key: string, value: any, ttl = 60 * 60): boolean {
  // Don't cache null, undefined, or empty arrays
  if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
    console.log(`[Memory Cache] Skipping cache for empty/null value for key: ${key}`)
    return false
  }

  const expiry = Date.now() + ttl * 1000
  cache.set(key, { value, expiry })
  return true
}

/**
 * Delete a value from the in-memory cache
 * @param key The cache key
 * @returns true if successful
 */
export function deleteFromMemoryCache(key: string): boolean {
  return cache.delete(key)
}

/**
 * Clear all items from the in-memory cache
 */
export function clearMemoryCache(): void {
  cache.clear()
}
