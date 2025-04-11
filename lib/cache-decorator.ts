import "server-only"

// Simple hash function for generating cache keys
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

// Function to generate a cache key
function generateCacheKey(prefix: string, args: any[]): string {
  try {
    // Convert arguments to a string representation
    const argsStr = args
      .map((arg) => {
        if (arg === null) return "null"
        if (arg === undefined) return "undefined"
        if (typeof arg === "function") return "function"
        if (typeof arg === "object") return JSON.stringify(arg)
        return String(arg)
      })
      .join("|")

    // Generate a simple hash of the arguments
    const argsHash = simpleHash(argsStr)

    // Combine prefix and hash
    return `${prefix}:${argsHash}`
  } catch (error) {
    console.error("Error generating cache key:", error)
    // Fallback to a timestamp-based key
    return `${prefix}:${Date.now()}`
  }
}

// Cache decorator for functions
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  prefix: string,
  ttl = 3600,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      // Dynamically import the redis-client module
      const { getFromCache, setCache } = await import("./redis-client")

      // Generate cache key
      const cacheKey = keyGenerator ? `${prefix}:${keyGenerator(...args)}` : generateCacheKey(prefix, args)

      // Try to get from cache
      const cachedResult = await getFromCache<ReturnType<T>>(cacheKey)
      if (cachedResult !== null) {
        console.log(`Cache hit for ${cacheKey}`)
        return cachedResult
      }

      // Cache miss, execute the function
      console.log(`Cache miss for ${cacheKey}`)
      const result = await fn(...args)

      // Cache the result
      if (result !== null && result !== undefined) {
        await setCache(cacheKey, result, ttl)
      }

      return result
    } catch (error) {
      console.error("Error in cached function:", error)
      // If caching fails, just execute the original function
      return fn(...args)
    }
  }) as T
}

// Function to invalidate cache
export async function invalidateCache(key: string): Promise<boolean> {
  try {
    // Dynamically import the redis-client module
    const { deleteFromCache } = await import("./redis-client")

    return await deleteFromCache(key)
  } catch (error) {
    console.error("Error invalidating cache:", error)
    return false
  }
}
