type CacheEntry<T> = {
  value: T
  expiry: number
}

/**
 * Get a value from the client-side cache
 * @param key The cache key
 * @returns The cached value or null if not found or expired
 */
export function getFromClientCache<T>(key: string): T | null {
  try {
    // Only run in browser
    if (typeof window === "undefined") return null

    const item = localStorage.getItem(`cache:${key}`)
    if (!item) return null

    const cacheEntry = JSON.parse(item) as CacheEntry<T>

    // Check if expired
    if (cacheEntry.expiry < Date.now()) {
      localStorage.removeItem(`cache:${key}`)
      return null
    }

    return cacheEntry.value
  } catch (error) {
    console.error(`Client cache error (get ${key}):`, error)
    return null
  }
}

/**
 * Set a value in the client-side cache
 * @param key The cache key
 * @param value The value to cache
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export function setClientCache<T>(key: string, value: T, ttl = 300): void {
  try {
    // Only run in browser
    if (typeof window === "undefined") return

    const expiry = Date.now() + ttl * 1000
    const cacheEntry: CacheEntry<T> = { value, expiry }

    localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry))
  } catch (error) {
    console.error(`Client cache error (set ${key}):`, error)
  }
}

/**
 * Clear a value from the client-side cache
 * @param key The cache key
 */
export function clearClientCache(key: string): void {
  try {
    // Only run in browser
    if (typeof window === "undefined") return

    localStorage.removeItem(`cache:${key}`)
  } catch (error) {
    console.error(`Client cache error (clear ${key}):`, error)
  }
}

/**
 * Clear all client-side cache entries
 */
export function clearAllClientCache(): void {
  try {
    // Only run in browser
    if (typeof window === "undefined") return

    // Only remove items that start with 'cache:'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("cache:")) {
        localStorage.removeItem(key)
      }
    }
  } catch (error) {
    console.error("Client cache error (clear all):", error)
  }
}
