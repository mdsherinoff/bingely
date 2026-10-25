import type { Metadata } from 'next'
import ResultsClient from './ResultsClient'
import { challengePlanMetadata } from '@/lib/planMetadata'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Server wrapper so shared links get a rich preview; the plan itself
// renders on the client
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params
  return challengePlanMetadata(id, searchParams)
}

export default function Page({ params }: Props) {
  return <ResultsClient params={params} />
}
