import { NextRequest, NextResponse } from 'next/server'
import { createShortLink, isShareablePath } from '@/lib/shortLinks'

// Turns a plan's long results URL into a short /s/<id> link
export async function POST(request: NextRequest) {
  let path: unknown
  try {
    ;({ path } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof path !== 'string' || !isShareablePath(path)) {
    return NextResponse.json(
      { error: 'Only plan links can be shortened' },
      { status: 400 }
    )
  }

  try {
    const id = await createShortLink(path)
    if (!id) {
      // No link store configured: the client shares the long URL instead
      return NextResponse.json(
        { error: 'Short links unavailable' },
        { status: 503 }
      )
    }
    return NextResponse.json({ url: `${request.nextUrl.origin}/s/${id}` })
  } catch (err) {
    console.error('Short link error:', err)
    return NextResponse.json(
      { error: 'Short links unavailable' },
      { status: 503 }
    )
  }
}
