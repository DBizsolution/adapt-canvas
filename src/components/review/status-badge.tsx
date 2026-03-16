import { Badge } from '@/components/ui/badge'
import type { EnrichedSectionReview } from '@/lib/review-utils'

const statusConfig = {
  approved: { label: 'Approved', variant: 'default' as const, className: 'text-[10px] px-2 py-0.5 bg-[#F0FDFA] text-[#115E59] border-[#14B8A6] hover:bg-[#F0FDFA]' },
  disputed: { label: 'Disputed', variant: 'default' as const, className: 'text-[10px] px-2 py-0.5 bg-white text-[#DC2626] border-[#EF4444] hover:bg-[#FEF2F2]' },
  pending: { label: 'Pending', variant: 'default' as const, className: 'text-[10px] px-2 py-0.5 bg-[#F8FAFC] text-[#475569] border-[#94A3B8] hover:bg-[#F8FAFC]' },
  revised: { label: 'Revised', variant: 'default' as const, className: 'text-[10px] px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] border-[#3B82F6] hover:bg-[#EFF6FF]' },
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
    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] border-[#F59E0B] hover:bg-[#FFFBEB]">
      {text}
    </Badge>
  )
}

export function EdgeBadge({ text }: { text: string }) {
  return (
    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-[#FEF2F2] text-[#991B1B] border-[#EF4444] hover:bg-[#FEF2F2]">
      {text}
    </Badge>
  )
}

/** Small amber circle with "?" — inline warn indicator matching the reference spec */
export function WarnIndicator({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#F59E0B] text-white text-[9px] font-bold align-middle ml-1.5 cursor-help"
      title={text}
    >
      ?
    </span>
  )
}

/** Small red circle with "!" — inline edge indicator matching the reference spec */
export function EdgeIndicator({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold align-middle ml-1.5 cursor-help"
      title={text}
    >
      !
    </span>
  )
}
