import { Badge } from '@/components/ui/badge'
import type { Priority } from '@/types'

const styles: Record<Priority, string> = {
  Low: 'bg-gray-200 text-gray-700',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="secondary" className={styles[priority]}>
      {priority}
    </Badge>
  )
}