'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sparkles, Loader2, RefreshCw, GripVertical, Send } from 'lucide-react'
import { useDrawerStore } from '@/stores/ai-drawer-store'
import { useReviewerStore } from '@/stores/reviewer-store'
import { SuggestionChips } from './suggestion-chips'
import { DiffPreview } from './diff-preview'
import { VersionHistory } from './version-history'
import type { IntentModel, SectionType } from '@/domain/intent-model/types'
import { URL_PARAM_TO_SECTION_TYPE } from '@/domain/intent-model/types'

type VersionMeta = {
  id: string
  timestamp: string
  author: string
  prompt: string
  parentId: string | null
}

const SECTION_LABELS: Record<string, string> = {
  actor: 'Actors',
  entity: 'Entities',
  journey: 'Journeys',
  business_rule: 'Rules',
  constraint: 'Constraints',
  open_question: 'Open Qs',
}

function getSectionTypeFromPath(pathname: string): SectionType | null {
  const segment = pathname.split('/').pop()
  if (!segment) return null
  return URL_PARAM_TO_SECTION_TYPE[segment] ?? null
}

export function ChatPanel({
  model,
  latestVersionId,
}: {
  model: IntentModel
  latestVersionId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const store = useDrawerStore()
  const { currentReviewerId } = useReviewerStore()

  const [prompt, setPrompt] = useState('')
  const [versions, setVersions] = useState<VersionMeta[]>([])
  const [isStale, setIsStale] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [panelWidth, setPanelWidth] = useState(460)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const sectionType = getSectionTypeFromPath(pathname)
  const sectionLabel = sectionType ? SECTION_LABELS[sectionType] ?? sectionType : null

  // Drag resize handler
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - e.clientX
      setPanelWidth(Math.max(360, Math.min(700, dragRef.current.startWidth + delta)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Fetch versions on mount
  useEffect(() => {
    fetch('/api/model/versions')
      .then(r => r.json())
      .then(data => {
        setVersions(data.versions ?? [])
        const latest = data.versions?.[data.versions.length - 1]
        if (latest && latest.id !== latestVersionId) {
          setIsStale(true)
        }
      })
      .catch(() => {})
  }, [latestVersionId])

  const handleSubmit = useCallback(async (text?: string) => {
    const p = text ?? prompt
    if (!p.trim()) return

    store.setLastPrompt(p)
    store.setStatus('loading')

    try {
      const res = await fetch('/api/model/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          scope: store.scope === 'section' && sectionType ? 'section' : 'full',
          sectionType: store.scope === 'section' && sectionType ? sectionType : undefined,
        }),
      })

      const data = await res.json()

      if (data.error === 'no_changes') {
        store.setError('No changes detected. Try rephrasing your prompt.')
        return
      }

      if (data.error === 'validation_failed') {
        store.setError(data.details?.join('\n') ?? 'Validation failed')
        return
      }

      if (!res.ok) {
        store.setError(data.message ?? 'Something went wrong')
        return
      }

      store.setProposal({
        proposalId: data.proposalId,
        diff: data.diff,
        proposedModel: data.proposedModel,
        warnings: data.warnings ?? [],
      })
      store.setStatus('diff_preview')
    } catch {
      store.setError('Failed to connect to the server')
    }
  }, [prompt, store, sectionType])

  const handleApprove = useCallback(async () => {
    if (!store.currentProposal || !currentReviewerId) return

    store.setStatus('applying')

    try {
      const res = await fetch('/api/model/edit/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: store.currentProposal.proposalId,
          author: currentReviewerId,
          prompt: store.lastPrompt ?? '',
        }),
      })

      const data = await res.json()

      if (data.error === 'proposal_expired') {
        const lastPrompt = useDrawerStore.getState().lastPrompt
        if (lastPrompt) {
          store.reset()
          handleSubmit(lastPrompt)
          return
        }
      }

      if (data.error === 'version_conflict') {
        store.setError('Model was updated by someone else. Retrying...')
        setTimeout(() => {
          const lastPrompt = useDrawerStore.getState().lastPrompt
          store.reset()
          if (lastPrompt) handleSubmit(lastPrompt)
        }, 1000)
        return
      }

      if (!res.ok) {
        store.setError(data.message ?? 'Failed to apply changes')
        return
      }

      store.setStatus('success')
      setPrompt('')
      const versionsData = await fetch('/api/model/versions').then(r => r.json())
      setVersions(versionsData.versions ?? [])
      setTimeout(() => {
        store.reset()
        router.refresh()
      }, 1500)
    } catch {
      store.setError('Failed to connect to the server')
    }
  }, [store, currentReviewerId, router, handleSubmit])

  const handleRevert = useCallback(async (versionId: string) => {
    if (!currentReviewerId) return
    setIsReverting(true)

    try {
      const res = await fetch('/api/model/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, author: currentReviewerId }),
      })

      if (res.ok) {
        const data = await fetch('/api/model/versions').then(r => r.json())
        setVersions(data.versions ?? [])
        router.refresh()
      }
    } catch {
      // silently fail
    } finally {
      setIsReverting(false)
    }
  }, [currentReviewerId, router])

  return (
    <div className="flex shrink-0" style={{ width: panelWidth }}>
      {/* Drag handle — left edge */}
      <div
        className="flex w-1.5 cursor-col-resize items-center justify-center transition-colors duration-200 hover:bg-black/[0.04] active:bg-[var(--bg-blue-subtle)]"
        onMouseDown={(e) => {
          e.preventDefault()
          dragRef.current = { startX: e.clientX, startWidth: panelWidth }
          setIsDragging(true)
        }}
      >
        <GripVertical size={10} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      </div>

      {/* Chat panel */}
      <div className="flex flex-1 flex-col overflow-hidden" style={{ background: 'var(--bg-page)' }}>

        {/* Sticky header */}
        <header
          className="flex h-[56px] shrink-0 items-center gap-3 px-4"
          style={{ background: 'var(--bg-page)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--acfs-navy)' }} />
          <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            VBS Chat
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{
              background: 'var(--bg-gray-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
            }}
          >
            gpt-4o-mini
          </span>
        </header>

        {/* Chat scroll area */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="mx-auto max-w-[768px] space-y-4 px-6 pt-6 pb-20">

            {/* Staleness banner */}
            {isStale && (
              <div
                className="flex items-center gap-2 rounded-xl p-3 text-sm"
                style={{ background: 'rgba(0,129,242,0.06)', color: 'var(--accent-blue)' }}
              >
                <span>Model has been updated.</span>
                <button
                  type="button"
                  onClick={() => { router.refresh(); setIsStale(false) }}
                  className="flex items-center gap-1 font-medium underline"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            )}

            {/* Welcome / onboarding when idle with no activity */}
            {store.status === 'idle' && versions.length <= 1 && !store.currentProposal && (
              <div className="space-y-4 pt-4">
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-white)', border: '1px solid var(--border-default)' }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={16} style={{ color: 'var(--acfs-navy)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Edit with AI
                    </span>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Describe changes in plain English. I can add actors, modify entities,
                    create business rules, or update any part of the intent model.
                  </p>
                  <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}>1</span>
                      Type your edit below or click a suggestion
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}>2</span>
                      Review the diff — see exactly what changed
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-blue-subtle)', color: 'var(--accent-blue)' }}>3</span>
                      Approve or reject — nothing changes until you say so
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scope toggle */}
            <div className="flex gap-1.5">
              {sectionLabel ? (
                <>
                  <button
                    type="button"
                    onClick={() => store.setScope('section')}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200"
                    style={{
                      background: store.scope === 'section' ? 'var(--bg-blue-subtle)' : 'var(--bg-gray-subtle)',
                      color: store.scope === 'section' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      border: store.scope === 'section' ? '1px solid rgba(0,129,242,0.2)' : '1px solid var(--border-light)',
                    }}
                  >
                    {sectionLabel} only
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setScope('full')}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200"
                    style={{
                      background: store.scope === 'full' ? 'var(--bg-blue-subtle)' : 'var(--bg-gray-subtle)',
                      color: store.scope === 'full' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      border: store.scope === 'full' ? '1px solid rgba(0,129,242,0.2)' : '1px solid var(--border-light)',
                    }}
                  >
                    Full model
                  </button>
                </>
              ) : (
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
                >
                  Editing full model
                </span>
              )}
            </div>

            {/* Suggestions */}
            <SuggestionChips model={model} onSelect={(s) => setPrompt(s)} />

            {/* Error state */}
            {store.status === 'error' && store.error && (
              <div className="space-y-2">
                <div
                  className="whitespace-pre-wrap rounded-xl p-3 text-sm"
                  style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid rgba(185,28,28,0.1)' }}
                >
                  {store.error}
                </div>
                <button
                  type="button"
                  onClick={store.reset}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200"
                  style={{ background: 'var(--bg-gray-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Diff preview */}
            {(store.status === 'diff_preview' || store.status === 'applying') && store.currentProposal && (
              <DiffPreview
                diff={store.currentProposal.diff}
                warnings={store.currentProposal.warnings}
                onApprove={handleApprove}
                onReject={store.reject}
                isApplying={store.status === 'applying'}
              />
            )}

            {/* Success state */}
            {store.status === 'success' && (
              <div
                className="rounded-xl p-3 text-sm"
                style={{ background: 'rgba(37,186,59,0.08)', color: '#15803D' }}
              >
                Changes applied successfully.
              </div>
            )}

            {/* Loading state - tool pill */}
            {store.status === 'loading' && (
              <div
                className="inline-flex items-center gap-2 rounded-[15px] px-3 py-1.5 text-sm"
                style={{ background: 'var(--bg-gray-subtle)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              >
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
                Generating changes...
              </div>
            )}

            {/* Version history — hide when empty */}
            {versions.length > 1 && (
              <VersionHistory
                versions={versions}
                onRevert={handleRevert}
                isReverting={isReverting}
              />
            )}
          </div>
        </div>

        {/* Input dock — sticky bottom */}
        {(store.status === 'idle' || store.status === 'loading') && (
          <div className="shrink-0 px-6 pb-4 pt-2" style={{ background: 'var(--bg-page)' }}>
            <div
              className="flex items-end gap-2 rounded-[22px] p-3"
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-dark)',
                boxShadow: 'var(--shadow-float)',
              }}
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the change you want to make..."
                disabled={store.status === 'loading'}
                rows={1}
                className="flex-1 resize-none bg-transparent text-base leading-6 outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
                style={{ color: 'var(--text-primary)', maxHeight: '120px', border: 'none', padding: '4px 0', boxShadow: 'none' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!prompt.trim() || store.status === 'loading'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-30"
                style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
