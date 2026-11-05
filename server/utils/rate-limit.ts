import { getRequestIP, setResponseHeader, type H3Event } from 'h3'

interface RateLimitBucket {
  count: number
  resetAt: number
}

const globalLimits = globalThis as typeof globalThis & { __anchaleeRateLimits?: Map<string, RateLimitBucket> }
const buckets = globalLimits.__anchaleeRateLimits || (globalLimits.__anchaleeRateLimits = new Map())

/** A small per-process limiter for public sensitive actions; use a shared store in multi-instance production. */
export function enforceRateLimit(event: H3Event, scope: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const ip = getRequestIP(event, { xForwardedFor: true }) || event.node.req.socket.remoteAddress || 'unknown'
  const key = `${scope}:${ip}`
  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  if (bucket.count >= maxRequests) {
    const retrySeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    setResponseHeader(event, 'Retry-After', retrySeconds)
    throw createError({ statusCode: 429, statusMessage: 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่' })
  }
  bucket.count += 1
  if (buckets.size > 5000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(entryKey)
    }
  }
}
