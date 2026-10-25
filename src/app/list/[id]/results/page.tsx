import type { Metadata } from 'next'
import ResultsClient from './ResultsClient'
import { listPlanMetadata } from '@/lib/planMetadata'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Server wrapper so shared links get a rich preview; the plan itself
// renders on the client
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  return listPlanMetadata(searchParams)
}

export default function Page({ params }: Props) {
  return <ResultsClient params={params} />
}
