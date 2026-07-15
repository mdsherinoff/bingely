import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'

// Plan config/goal/items travel through the URL so links are shareable
// without a backend. LZ-compressing the JSON before it hits the query
// string cuts a typical config+goal link from ~1000 chars to ~400.
export function encodeState(value: unknown): string {
  return compressToEncodedURIComponent(JSON.stringify(value))
}

export function decodeState<T>(raw: string): T | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(raw)
    if (decompressed) return JSON.parse(decompressed) as T
  } catch {
    // fall through to legacy format below
  }

  // Links shared before compression was added are still plain
  // encodeURIComponent(JSON.stringify(...)) — keep them working.
  try {
    return JSON.parse(decodeURIComponent(raw)) as T
  } catch {
    return null
  }
}
