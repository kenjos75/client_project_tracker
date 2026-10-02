import { Badge } from '@/components/ui/badge'
import type { Status } from '@/types'

const styles: Record<Status, string> = {
  Planning: 'bg-indigo-100 text-indigo-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-amber-100 text-amber-800',
  Completed: 'bg-emerald-100 text-emerald-800',
}

export default function StatusBadge({ status }: { status: Status }) {
  return <Badge className={styles[status]}>{status}</Badge>
}