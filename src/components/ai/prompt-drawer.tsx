'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sparkles, X, Loader2, RefreshCw } from 'lucide-react'
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

function getSectionTypeFromPath(pathname: string): SectionType | null {
  const segment = pathname.split('/').pop()
  if (!segment) return null
  return URL_PARAM_TO_SECTION_TYPE[segment] ?? null
}

export function PromptDrawer({
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

  const sectionType = getSectionTypeFromPath(pathname)

  // Check staleness on drawer open
  useEffect(() => {
    if (!store.isOpen) return
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
  }, [store.isOpen, latestVersionId])

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
          sectionType: store.scope === 'section' ? sectionType : undefined,
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
      // Refresh version history
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
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={store.open}
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#002C61] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="AI Editor"
      >
        <Sparkles size={20} />
      </button>

      {/* Backdrop */}
      {store.isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={store.close}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-30 flex h-full w-[400px] flex-col bg-white shadow-xl transition-transform duration-200 ${
          store.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#002C61]" />
            <h3 className="text-sm font-semibold text-slate-800">AI Editor</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => store.setScope(store.scope === 'section' ? 'full' : 'section')}
              className="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
              style={{
                borderColor: store.scope === 'section' ? '#002C61' : '#cbd5e1',
                color: store.scope === 'section' ? '#002C61' : '#64748b',
                backgroundColor: store.scope === 'section' ? '#002C61' + '10' : 'transparent',
              }}
            >
              {store.scope === 'section' && sectionType
                ? sectionType.replace('_', ' ')
                : 'Full model'}
            </button>
            <button type="button" onClick={store.close} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Staleness banner */}
          {isStale && (
            <div className="flex items-center gap-2 rounded bg-amber-50 p-2 text-xs text-amber-700">
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

          {/* Idle state: suggestions + input */}
          {(store.status === 'idle' || store.status === 'loading') && (
            <>
              <SuggestionChips model={model} onSelect={(s) => setPrompt(s)} />

              <div className="space-y-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the change you want to make..."
                  disabled={store.status === 'loading'}
                  className="h-24 w-full resize-none rounded border border-slate-200 p-3 text-sm placeholder:text-slate-400 focus:border-[#002C61] focus:outline-none focus:ring-1 focus:ring-[#002C61] disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!prompt.trim() || store.status === 'loading'}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#002C61] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003a7d] disabled:opacity-50"
                >
                  {store.status === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Error state */}
          {store.status === 'error' && store.error && (
            <div className="space-y-2">
              <div className="rounded bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">
                {store.error}
              </div>
              <button
                type="button"
                onClick={store.reset}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          )}

          {/* Diff preview state */}
          {store.status === 'diff_preview' && store.currentProposal && (
            <DiffPreview
              diff={store.currentProposal.diff}
              warnings={store.currentProposal.warnings}
              onApprove={handleApprove}
              onReject={store.reject}
              isApplying={false}
            />
          )}

          {/* Applying state */}
          {store.status === 'applying' && store.currentProposal && (
            <DiffPreview
              diff={store.currentProposal.diff}
              warnings={store.currentProposal.warnings}
              onApprove={handleApprove}
              onReject={store.reject}
              isApplying={true}
            />
          )}

          {/* Success state */}
          {store.status === 'success' && (
            <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">
              Changes applied successfully.
            </div>
          )}

          {/* Version history */}
          <VersionHistory
            versions={versions}
            onRevert={handleRevert}
            isReverting={isReverting}
          />
        </div>
      </div>
    </>
  )
}
