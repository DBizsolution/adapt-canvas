import { Badge } from '@/components/ui/badge'
import type { EnrichedSectionReview } from '@/lib/review-utils'

const statusConfig = {
  approved: { label: 'Approved', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100' },
  disputed: { label: 'Disputed', variant: 'default' as const, className: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100' },
  pending: { label: 'Pending', variant: 'default' as const, className: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-100' },
  revised: { label: 'Revised', variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100' },
}

export function StatusBadge({ status }: { status: EnrichedSectionReview['effectiveStatus'] }) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export function WarnBadge({ text }: { text: string }) {
  return (
    <Badge variant="default" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
      {text}
    </Badge>
  )
}

export function EdgeBadge({ text }: { text: string }) {
  return (
    <Badge variant="default" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
      {text}
    </Badge>
  )
}
