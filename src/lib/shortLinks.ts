import 'server-only'
import { Redis } from '@upstash/redis'

// Short share links (/s/aB3xQ9k2) map to a plan's full results URL.
// Production stores them in Upstash Redis (set up via Vercel's
// Marketplace). Locally, without credentials, an in-memory map stands
// in so the flow can be developed end to end. In production without
// credentials, short links are reported as unavailable and the app
// falls back to sharing the long URL.

interface Store {
  get(id: string): Promise<string | null>
  set(id: string, path: string): Promise<void>
}

const TWO_YEARS = 60 * 60 * 24 * 365 * 2
const PREFIX = 'share:'

function hasRedisEnv(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
  )
}

const globalForStore = globalThis as unknown as {
  bingelyDevLinks?: Map<string, string>
}

function getStore(): Store | null {
  if (hasRedisEnv()) {
    const redis = Redis.fromEnv()
    return {
      get: (id) => redis.get<string>(PREFIX + id),
      set: async (id, path) => {
        await redis.set(PREFIX + id, path, { ex: TWO_YEARS })
      },
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    const map = (globalForStore.bingelyDevLinks ??= new Map())
    return {
      get: async (id) => map.get(id) ?? null,
      set: async (id, path) => {
        map.set(id, path)
      },
    }
  }
  return null
}

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// The same plan always gets the same id, so sharing twice doesn't mint
// a second link (and the ID reveals nothing about the plan)
async function idFor(path: string, length: number): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(path))
  )
  let id = ''
  for (let i = 0; i < length; i++) id += ALPHABET[digest[i] % ALPHABET.length]
  return id
}

// Only plan result pages can be shortened — never arbitrary URLs
export function isShareablePath(path: string): boolean {
  return (
    path.length <= 4000 &&
    /^\/(plan\/\d+|list\/[A-Za-z0-9_-]+|challenges\/[a-z0-9-]+)\/results\?/.test(
      path
    )
  )
}

export function shortLinksAvailable(): boolean {
  return getStore() !== null
}

export async function createShortLink(path: string): Promise<string | null> {
  const store = getStore()
  if (!store) return null
  for (let length = 8; length <= 12; length++) {
    const id = await idFor(path, length)
    const existing = await store.get(id)
    if (existing === null || existing === path) {
      if (existing === null) await store.set(id, path)
      return id
    }
    // Different plan already holds this id: try a longer one
  }
  return null
}

export async function resolveShortLink(id: string): Promise<string | null> {
  if (!/^[0-9A-Za-z]{8,12}$/.test(id)) return null
  const store = getStore()
  if (!store) return null
  const path = await store.get(id)
  return path && isShareablePath(path) ? path : null
}
