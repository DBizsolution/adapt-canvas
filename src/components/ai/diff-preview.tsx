'use client'

import { Plus, Minus, Pencil, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { ModelDiff, ItemChange, FieldChange } from '@/lib/model-diff'

const changeStyles = {
  added: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', icon: Plus, label: 'Added' },
  removed: { border: 'border-l-red-500', bg: 'bg-red-50', icon: Minus, label: 'Removed' },
  modified: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: Pencil, label: 'Modified' },
} as const

function FieldChanges({ fields }: { fields: FieldChange[] }) {
  return (
    <div className="mt-2 space-y-1 text-xs">
      {fields.map((f) => (
        <div key={f.field} className="flex gap-2">
          <span className="font-medium text-slate-500 min-w-20">{f.field}:</span>
          <span className="text-red-600 line-through">{JSON.stringify(f.old)}</span>
          <span className="text-emerald-600">{JSON.stringify(f.new)}</span>
        </div>
      ))}
    </div>
  )
}

function ChangeItem({ change }: { change: ItemChange }) {
  const [expanded, setExpanded] = useState(false)
  const style = changeStyles[change.type]
  const Icon = style.icon

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} rounded-r p-2`}>
      <button
        type="button"
        onClick={() => change.fields && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left text-sm"
      >
        <Icon size={14} />
        <span className="font-medium">{change.itemName}</span>
        <span className="ml-auto text-xs text-slate-400">{style.label}</span>
      </button>
      {expanded && change.fields && <FieldChanges fields={change.fields} />}
    </div>
  )
}

export function DiffPreview({
  diff,
  warnings,
  onApprove,
  onReject,
  isApplying,
}: {
  diff: ModelDiff
  warnings: string[]
  onApprove: () => void
  onReject: () => void
  isApplying: boolean
}) {
  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w) => (
            <div key={w} className="flex items-start gap-2 rounded bg-amber-50 p-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {diff.sections.map((section) => (
        <div key={section.sectionType}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {section.sectionType.replace('_', ' ')}
          </h4>
          <div className="space-y-1.5">
            {section.changes.map((change) => (
              <ChangeItem key={change.itemId} change={change} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={isApplying}
          className="flex-1 rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
        >
          {isApplying ? 'Applying...' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isApplying}
          className="flex-1 rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}
