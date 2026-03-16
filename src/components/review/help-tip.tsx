'use client'

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

export function HelpTip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center justify-center cursor-help shrink-0 text-[#94A3B8] hover:text-[#64748B] transition-colors">
          <Info size={14} />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm text-sm leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
