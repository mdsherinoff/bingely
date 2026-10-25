import { notFound, redirect } from 'next/navigation'
import { resolveShortLink } from '@/lib/shortLinks'

export const metadata = { title: 'Shared plan' }

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let path: string | null = null
  try {
    path = await resolveShortLink(id)
  } catch {
    path = null
  }
  if (path) redirect(path)
  notFound()
}
