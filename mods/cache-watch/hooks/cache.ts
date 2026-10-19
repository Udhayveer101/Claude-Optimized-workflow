// How long the prompt cache stays warm after a request. A session starts on 1h
// (register.tsx) and drops to this 5m if learnTtl or a model switch says so.
export const TTL_MS = 5 * 60_000
export const TTL_1H_MS = 60 * 60_000

// Remind this long before cold: 5 minutes, or 40% of a TTL too short for that
// (a 5-minute warning on a 5-minute cache would fire after every response).
export const remindMs = (ttl: number) => Math.min(5 * 60_000, ttl * 0.4)
export const REMIND_MS = remindMs(TTL_MS)

export type Phase = 'none' | 'warm' | 'cooling' | 'cold'

export type CacheStatus = { phase: Phase; leftMs: number; fraction: number }

export function cacheStatus(
  last: number | null,
  now: number,
  ttl = TTL_MS,
  remind = remindMs(ttl),
): CacheStatus {
  if (last === null) {
    return { phase: 'none', leftMs: 0, fraction: 0 }
  }

  const leftMs = Math.max(0, last + ttl - now)
  const phase = leftMs === 0 ? 'cold' : leftMs <= remind ? 'cooling' : 'warm'

  return { phase, leftMs, fraction: leftMs / ttl }
}

// True once per warm period: `reminded` holds the `last` it already fired for.
export function shouldRemind(
  last: number | null,
  reminded: number | null,
  now: number,
  ttl = TTL_MS,
  remind = remindMs(ttl),
): boolean {
  return last !== reminded && cacheStatus(last, now, ttl, remind).phase === 'cooling'
}

export function mmss(ms: number): string {
  const seconds = Math.ceil(ms / 1000)

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function until(iso: string | undefined, now: number): string {
  const minutes = Math.round((Date.parse(iso ?? '') - now) / 60_000)

  if (!(minutes > 0)) {
    return ''
  }

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)

  return hours < 24 ? `${hours}h ${minutes % 60}m` : `${Math.floor(hours / 24)}d ${hours % 24}h`
}

// Reads the TTL off a request that came after a gap only a 1h cache survives:
// served mostly from cache, the entry outlived five minutes; rewritten, it did not.
export function learnTtl(
  gapMs: number,
  usage: { cache_read_input_tokens: number; cache_creation_input_tokens: number } | null,
): number | null {
  const slack = 15_000

  if (usage === null || gapMs <= TTL_MS + slack || gapMs >= TTL_1H_MS - slack) {
    return null
  }

  const { cache_read_input_tokens: served, cache_creation_input_tokens: written } = usage

  if (served + written === 0) {
    return null
  }

  return served > written ? TTL_1H_MS : TTL_MS
}
