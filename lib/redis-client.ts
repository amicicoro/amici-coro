import 'server-only';

// Import types only
import type { RedisClientType } from 'redis';

// Import cache stats
import {
  recordCacheHit,
  recordCacheMiss,
  recordCacheSet,
  recordCacheError,
} from '@/lib/cache-stats';

import {
  getFromMemoryCache,
  setMemoryCache,
  deleteFromMemoryCache,
} from './memory-cache';

// Flag to track if Redis is available in this environment
let isRedisAvailable = true;
let redisClient: RedisClientType | null = null;
let isRedisInitialized = false;

// Update the getRedisClient function to handle build-time gracefully
async function getRedisClient() {
  // If we've already tried to initialize Redis and it's not available, don't try again
  if (isRedisInitialized && !isRedisAvailable) {
    return null;
  }

  // Skip Redis connection during build time
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    console.log('[Redis] Skipping Redis connection during build phase');
    isRedisAvailable = false;
    isRedisInitialized = true;
    return null;
  }

  if (!redisClient) {
    try {
      // Try to dynamically import Redis
      const redis = await import('redis').catch(() => {
        console.warn(
          '[Redis] Redis client cannot be imported in this environment',
        );
        isRedisAvailable = false;
        return null;
      });

      // If import failed, return null
      if (!redis) {
        isRedisInitialized = true;
        return null;
      }

      // Check if REDIS_URL is available
      if (!process.env.REDIS_URL) {
        console.warn('[Redis] REDIS_URL environment variable is not set');
        isRedisAvailable = false;
        isRedisInitialized = true;
        return null;
      }

      redisClient = redis.createClient({
        url: process.env.REDIS_URL || '',
      });

      // Set up error handling
      redisClient.on('error', (err: any) => {
        console.error('[Redis] Connection error:', err);
        recordCacheError();
      });

      // Connect to Redis
      await redisClient.connect();
      console.log('[Redis] Client connected successfully');
      isRedisInitialized = true;
    } catch (error) {
      console.error('[Redis] Faile d to create client:', error);
      recordCacheError();
      isRedisAvailable = false;
      isRedisInitialized = true;
      return null;
    }
  }

  return redisClient;
}

// Update the default cache TTL to 1 day instead of 1 hour
export const DEFAULT_CACHE_TTL = 60 * 60 * 24; // 24 hours

/**
 * Get a value from the cache
 * @param key The cache key
 * @returns The cached value or null if not found
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    // Try memory cache first if Redis is not available
    if (!isRedisAvailable) {
      const memoryResult = getFromMemoryCache<T>(key);
      if (memoryResult) {
        recordCacheHit();
      } else {
        recordCacheMiss();
      }
      return memoryResult;
    }

    console.log(`[Redis] Attempting to get key: ${key}`);
    const client = await getRedisClient();
    if (!client) {
      // Fallback to memory cache
      const memoryResult = getFromMemoryCache<T>(key);
      if (memoryResult) {
        recordCacheHit();
      } else {
        recordCacheMiss();
      }
      return memoryResult;
    }

    const cachedData = await client.get(key);

    if (cachedData) {
      console.log(`[Redis] Cache HIT for key: ${key}`);
      recordCacheHit();
      // Parse the JSON string back to an object
      return JSON.parse(cachedData) as T;
    } else {
      console.log(`[Redis] Cache MISS for key: ${key}`);
      recordCacheMiss();
      return null;
    }
  } catch (error) {
    console.error(`[Redis] Cache error (get ${key}):`, error);
    recordCacheError();

    // Propagate the error instead of falling back to memory cache
    throw error;
  }
}

/**
 * Set a value in the cache with optional TTL
 * @param key The cache key
 * @param value The value to cache
 * @param ttl Time to live in seconds (optional)
 * @returns true if successful, false otherwise
 */
export async function setCache(
  key: string,
  value: any,
  ttl = DEFAULT_CACHE_TTL,
): Promise<boolean> {
  try {
    // Allow caching of empty arrays - they are valid states
    // Only skip null and undefined values
    if (value === null || value === undefined) {
      console.log(
        `[Redis] Skipping cache for null/undefined value for key: ${key}`,
      );
      return false;
    }

    // Use memory cache if Redis is not available
    if (!isRedisAvailable) {
      const result = setMemoryCache(key, value, ttl);
      if (result) recordCacheSet();
      return result;
    }

    console.log(`[Redis] Setting cache for key: ${key} with TTL: ${ttl}s`);
    const client = await getRedisClient();
    if (!client) {
      // Fallback to memory cache
      const result = setMemoryCache(key, value, ttl);
      if (result) recordCacheSet();
      return result;
    }

    // Convert value to JSON string
    const stringValue = JSON.stringify(value);

    // Set with expiration
    await client.set(key, stringValue, { EX: ttl });

    console.log(`[Redis] Successfully cached key: ${key}`);
    recordCacheSet();
    return true;
  } catch (error) {
    console.error(`[Redis] Cache error (set ${key}):`, error);
    recordCacheError();

    // Propagate the error instead of falling back to memory cache
    throw error;
  }
}

/**
 * Delete a value from the cache
 * @param key The cache key
 * @returns true if successful, false otherwise
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  try {
    // Use memory cache if Redis is not available
    if (!isRedisAvailable) {
      return deleteFromMemoryCache(key);
    }

    const client = await getRedisClient();
    if (!client) {
      // Fallback to memory cache
      return deleteFromMemoryCache(key);
    }

    await client.del(key);

    // Also delete from memory cache to ensure consistency
    deleteFromMemoryCache(key);

    return true;
  } catch (error) {
    console.error(`[Redis] Cache error (delete ${key}):`, error);
    recordCacheError();

    // Propagate the error
    throw error;
  }
}

/**
 * Delete multiple values from the cache using a pattern
 * @param pattern The pattern to match keys (e.g., "events:*")
 * @returns The number of keys deleted
 */
export async function deleteByPattern(pattern: string): Promise<number> {
  try {
    // Skip if Redis is not available - memory cache doesn't support pattern matching
    if (!isRedisAvailable) {
      return 0;
    }

    const client = await getRedisClient();
    if (!client) {
      return 0;
    }

    // Use SCAN to find keys matching the pattern
    let cursor = 0;
    let keys: string[] = [];

    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== 0);

    if (keys.length === 0) return 0;

    // Delete all found keys
    await client.del(keys);

    // Also delete from memory cache to ensure consistency
    keys.forEach(key => deleteFromMemoryCache(key));

    return keys.length;
  } catch (error) {
    console.error(`[Redis] Cache error (deleteByPattern ${pattern}):`, error);
    recordCacheError();

    // Propagate the error
    throw error;
  }
}
