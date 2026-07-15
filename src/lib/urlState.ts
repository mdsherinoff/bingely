import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'

// Plan config/goal/items travel through the URL so links are shareable
// without a backend. LZ-compressing the JSON before it hits the query
// string cuts a typical config+goal link from ~1000 chars to ~400.
//
// compressToEncodedURIComponent's output alphabet includes '+', and
// URLSearchParams (what useSearchParams/searchParams.get is built on)
// follows application/x-www-form-urlencoded rules where a literal '+'
// in a query value means space — so ~95% of compressed payloads were
// silently corrupted before reaching decompressFromEncodedURIComponent.
// Wrapping in encodeURIComponent escapes '+' to '%2B' so it survives
// the round trip; searchParams.get() already percent-decodes it back
// on the way out, so decodeState reads the raw value as-is.
export function encodeState(value: unknown): string {
  return encodeURIComponent(compressToEncodedURIComponent(JSON.stringify(value)))
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
