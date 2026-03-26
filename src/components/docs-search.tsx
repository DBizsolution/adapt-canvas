'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
  'Searching...',
  'Reading through the docs...',
  'This is harder than I thought...',
  'Still looking...',
  'Man, this is taking a while...',
  'Digging deeper...',
  'Almost there... maybe...',
  'Ok seriously, where is it...',
  'Found something! Processing...',
  'Connecting the dots...',
  'Making sense of it all...',
  'Crafting the perfect answer...',
]

export function DocsSearch() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  // Rotate loading messages every 2 seconds
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [loading])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter at least 3 characters')
      return
    }

    if (query.length > 500) {
      setError('Query is too long (max 500 characters)')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch('/api/docs-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search')
      }

      setAnswer(data.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about VBS Intent documentation..."
            className={cn(
              'w-full rounded-lg border pl-12 pr-32 py-3.5',
              'text-sm outline-none transition-all',
              'focus:ring-2 focus:ring-blue-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--bg-default)',
              color: 'var(--text-primary)',
            }}
            disabled={loading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !query.trim() || query.trim().length < 3}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'flex items-center gap-2 rounded-md px-4 py-2',
              'text-sm font-medium transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{
              background: loading || !query.trim() || query.trim().length < 3 ? 'var(--bg-muted)' : 'var(--accent-blue)',
              color: 'white',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>AI Search</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {query.length}/500 characters
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: '#ef444480', background: '#ef44441a' }}>
          <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
          <div>
            <div className="font-medium" style={{ color: '#ef4444' }}>Error</div>
            <div className="mt-1 text-sm" style={{ color: '#ef4444e6' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--accent-blue)33', background: 'var(--bg-blue-subtle)' }}>
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin shrink-0" style={{ color: 'var(--accent-blue)' }} />
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--accent-blue)' }}>
                Thinking...
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {LOADING_MESSAGES[loadingMessageIndex]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-default)' }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>
            <Sparkles size={16} />
            <span>AI Answer</span>
          </div>
          <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }} {...props} />,
                h2: ({ ...props }) => <h4 className="text-base font-semibold mt-3 mb-2" style={{ color: 'var(--text-primary)' }} {...props} />,
                h3: ({ ...props }) => <h5 className="text-sm font-semibold mt-2 mb-1" style={{ color: 'var(--text-primary)' }} {...props} />,
                p: ({ ...props }) => <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }} {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                li: ({ ...props }) => <li className="text-sm" style={{ color: 'var(--text-primary)' }} {...props} />,
                code: ({ ...props }) => <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }} {...props} />,
                strong: ({ ...props }) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }} {...props} />,
                em: ({ ...props }) => <em className="italic" {...props} />,
                blockquote: ({ ...props }) => <blockquote className="border-l-4 pl-4 italic my-3" style={{ borderColor: 'var(--accent-blue)33', color: 'var(--text-muted)' }} {...props} />,
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ✨ Generated by AI • Always verify critical information
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!answer && !loading && !error && (
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-subtle)' }}>
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            💡 Try asking about:
          </div>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>• "What is the intent model?"</li>
            <li>• "Explain the slot allocation process"</li>
            <li>• "How does delegation work?"</li>
            <li>• "What are the validation rules?"</li>
            <li>• "Explain the schema design"</li>
          </ul>
        </div>
      )}
    </div>
  )
}
