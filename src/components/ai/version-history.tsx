'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'

type VersionMeta = {
  id: string
  timestamp: string
  author: string
  prompt: string
  parentId: string | null
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function VersionHistory({
  versions,
  onRevert,
  isReverting,
}: {
  versions: VersionMeta[]
  onRevert: (versionId: string) => void
  isReverting: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const reversed = [...versions].reverse()

  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        History ({versions.length})
      </button>

      {isOpen && (
        <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
          {reversed.map((v, i) => (
            <div key={v.id} className="flex items-start gap-2 rounded p-2 text-xs hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">{v.author}</span>
                  <span className="text-slate-400">{timeAgo(v.timestamp)}</span>
                </div>
                <p className="truncate text-slate-500">{v.prompt}</p>
              </div>
              {i > 0 && (
                confirmId === v.id ? (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => { onRevert(v.id); setConfirmId(null) }}
                      disabled={isReverting}
                      className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded px-2 py-0.5 text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(v.id)}
                    className="shrink-0 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                    title="Revert to this version"
                  >
                    <RotateCcw size={12} />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
