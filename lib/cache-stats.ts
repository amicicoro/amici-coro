import "server-only"

// Simple in-memory cache statistics
let stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  errors: 0,
  lastReset: new Date().toISOString(),
}

export function recordCacheHit() {
  stats.hits++
}

export function recordCacheMiss() {
  stats.misses++
}

export function recordCacheSet() {
  stats.sets++
}

export function recordCacheError() {
  stats.errors++
}

export function resetStats() {
  stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    errors: 0,
    lastReset: new Date().toISOString(),
  }
}

export function getCacheStats() {
  const hitRate = stats.hits + stats.misses > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) : "0.00"

  return {
    ...stats,
    hitRate: `${hitRate}%`,
    total: stats.hits + stats.misses,
  }
}
