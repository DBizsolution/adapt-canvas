'use client'

import React, { useState, useEffect } from 'react'
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES_POOL = [
  'Yo, digging through the docs...',
  'Scanning 100+ endpoints... this better be worth it',
  'Reading faster than you can type tbh',
  'Found something... wait, nope, wrong file',
  'Ctrl+F on steroids right now',
  'Checking API endpoints... so many UUIDs',
  'Your question is making me work harder than I wanted',
  'Skimming through logistics docs like it\'s my day job',
  'This is taking longer than expected, my bad',
  'Almost there... I think... maybe',
  'Ok I lied, still searching, hold tight',
  'Found it. Cooking up an answer...',
  'Putting the pieces together... standby',
]

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function DocsSearch() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [loadingMessages, setLoadingMessages] = useState<string[]>(['Searching...', ...shuffleArray(LOADING_MESSAGES_POOL)])

  // Rotate loading messages every 1.8 seconds
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0)
      // Reshuffle for next time
      setLoadingMessages(['Searching...', ...shuffleArray(LOADING_MESSAGES_POOL)])
      return
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 1800)

    return () => clearInterval(interval)
  }, [loading, loadingMessages])

  const handleSearch = async (e: React.FormEvent, presetQuery?: string) => {
    e.preventDefault()

    const searchQuery = presetQuery || query

    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setError('Please enter at least 3 characters')
      return
    }

    if (searchQuery.length > 500) {
      setError('Query is too long (max 500 characters)')
      return
    }

    const userMessage: Message = { role: 'user', content: searchQuery.trim() }
    const newMessages = [...messages, userMessage]

    setMessages(newMessages)
    setLoading(true)
    setError('')
    setQuery('')

    try {
      const response = await fetch('/api/docs-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search')
      }

      const assistantMessage: Message = { role: 'assistant', content: data.answer }
      setMessages([...newMessages, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Remove the user message if request failed
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setQuery('')
    setError('')
  }

  const handlePresetQuestion = (question: string) => {
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
    handleSearch(syntheticEvent, question)
  }

  return (
    <div className="space-y-4">
      {/* Conversation Thread */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-lg border p-4',
                message.role === 'user'
                  ? 'bg-blue-50/50'
                  : ''
              )}
              style={{
                borderColor: message.role === 'user' ? 'var(--accent-blue)33' : 'var(--border-default)',
                background: message.role === 'user' ? 'var(--bg-blue-subtle)' : 'var(--bg-default)',
              }}
            >
              {message.role === 'user' ? (
                <div>
                  <div className="text-xs font-medium mb-2" style={{ color: 'var(--accent-blue)' }}>
                    You asked:
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {message.content}
                  </div>
                </div>
              ) : (
                <div>
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
                        p: ({ children, ...props }) => {
                          // Convert .md file mentions and API references to clickable links
                          const processedChildren = React.Children.map(children, (child) => {
                            if (typeof child === 'string') {
                              // Split by both .md files and API endpoint references
                              const parts = child.split(/(\S+\.md|API endpoints? (?:reference|page|section|catalog))/gi)
                              return parts.map((part, idx) => {
                                if (part.endsWith('.md')) {
                                  const slug = part.replace('.md', '')
                                  return (
                                    <a
                                      key={idx}
                                      href={`/review/docs?doc=${slug}`}
                                      className="text-blue-600 hover:underline font-medium"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        window.location.href = `/review/docs?doc=${slug}`
                                      }}
                                    >
                                      {part}
                                    </a>
                                  )
                                }
                                if (/API endpoints? (?:reference|page|section|catalog)/i.test(part)) {
                                  return (
                                    <a
                                      key={idx}
                                      href="/review/api-endpoints"
                                      className="text-blue-600 hover:underline font-medium"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        window.location.href = '/review/api-endpoints'
                                      }}
                                    >
                                      {part}
                                    </a>
                                  )
                                }
                                return part
                              })
                            }
                            return child
                          })
                          return <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }} {...props}>{processedChildren}</p>
                        },
                        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({ children, ...props }) => {
                          // Convert .md file mentions and API references to clickable links in list items too
                          const processedChildren = React.Children.map(children, (child) => {
                            if (typeof child === 'string') {
                              const parts = child.split(/(\S+\.md|API endpoints? (?:reference|page|section|catalog))/gi)
                              return parts.map((part, idx) => {
                                if (part.endsWith('.md')) {
                                  const slug = part.replace('.md', '')
                                  return (
                                    <a
                                      key={idx}
                                      href={`/review/docs?doc=${slug}`}
                                      className="text-blue-600 hover:underline font-medium"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        window.location.href = `/review/docs?doc=${slug}`
                                      }}
                                    >
                                      {part}
                                    </a>
                                  )
                                }
                                if (/API endpoints? (?:reference|page|section|catalog)/i.test(part)) {
                                  return (
                                    <a
                                      key={idx}
                                      href="/review/api-endpoints"
                                      className="text-blue-600 hover:underline font-medium"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        window.location.href = '/review/api-endpoints'
                                      }}
                                    >
                                      {part}
                                    </a>
                                  )
                                }
                                return part
                              })
                            }
                            return child
                          })
                          return <li className="text-sm" style={{ color: 'var(--text-primary)' }} {...props}>{processedChildren}</li>
                        },
                        code: ({ ...props }) => <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }} {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }} {...props} />,
                        em: ({ ...props }) => <em className="italic" {...props} />,
                        blockquote: ({ ...props }) => <blockquote className="border-l-4 pl-4 italic my-3" style={{ borderColor: 'var(--accent-blue)33', color: 'var(--text-muted)' }} {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
            placeholder={messages.length > 0 ? 'Ask a follow-up question...' : 'Ask about VBS Intent documentation or API endpoints...'}
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
        <div className="mt-1 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{query.length}/500 characters</span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="text-xs hover:underline"
              style={{ color: 'var(--accent-blue)' }}
            >
              Clear conversation
            </button>
          )}
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
                {loadingMessages[loadingMessageIndex]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {messages.length === 0 && !loading && !error && (
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-subtle)' }}>
          <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-lg">💡</span>
            <span>Try asking about:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'What is the intent model?',
              'Show me all HBL endpoints',
              'Which API endpoints use UUIDs?',
              'How does delegation work?',
              'What\'s the endpoint for booking slots?',
              'Explain the schema design'
            ].map((question, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetQuestion(question)}
                disabled={loading}
                className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-blue)'
                  e.currentTarget.style.color = 'var(--accent-blue)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation footer */}
      {messages.length > 0 && !loading && (
        <div className="text-xs text-center pt-2" style={{ color: 'var(--text-muted)' }}>
          ✨ Generated by AI • Always verify critical information
        </div>
      )}
    </div>
  )
}
