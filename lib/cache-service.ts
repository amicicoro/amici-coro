import { getFromCache, setCache, deleteFromCache } from './redis-client';

// Cache service class for more object-oriented approach
export class CacheService {
  private keyPrefix: string;
  private defaultTtl: number;

  constructor(keyPrefix: string, defaultTtl: number = 60 * 60 * 24) {
    this.keyPrefix = keyPrefix;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Generate a cache key
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    return getFromCache<T>(cacheKey);
  }

  /**
   * Set a value in the cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const cacheKey = this.generateKey(key);
    return setCache(cacheKey, value, ttl || this.defaultTtl);
  }

  /**
   * Delete a value from the cache
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);
    return deleteFromCache(cacheKey);
  }

  /**
   * Wrap a function with caching
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cacheKey = this.generateKey(key);

    // Try to get from cache first
    const cachedValue = await getFromCache<T>(cacheKey);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Call the function
    const result = await fn();

    // Cache the result
    if (result !== null && result !== undefined) {
      await setCache(cacheKey, result, ttl || this.defaultTtl);
    }

    return result;
  }
}
