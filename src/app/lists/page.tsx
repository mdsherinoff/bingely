import { redirect } from 'next/navigation'

// Lists now live in the Library alongside followed plans
export default function ListsPage() {
  redirect('/library')
}
