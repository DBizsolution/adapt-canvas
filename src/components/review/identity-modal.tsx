'use client'

import { useState } from 'react'
import { useReviewerStore } from '@/stores/reviewer-store'
import { User } from 'lucide-react'

const REVIEWERS = [
  { id: 'rahul', name: 'Rahul' },
  { id: 'roni', name: 'Roni' },
  { id: 'kavya', name: 'Kavya' },
  { id: 'other', name: 'Other' },
]

export function IdentityModal() {
  const { currentReviewerId, setCurrentReviewer } = useReviewerStore()
  const [selected, setSelected] = useState<string | null>(null)

  if (currentReviewerId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm mx-4 overflow-hidden rounded-2xl" style={{ background: 'var(--bg-white)', boxShadow: 'var(--shadow-overlay)' }}>
        <div className="px-6 pt-8 pb-4 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--acfs-navy)' }}
          >
            <User size={24} style={{ color: 'var(--text-white)' }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Who are you?</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Select your name to start reviewing</p>
        </div>

        <div className="px-6 pb-2 space-y-2">
          {REVIEWERS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: selected === r.id ? 'var(--acfs-navy)' : 'var(--bg-card-gray)',
                color: selected === r.id ? 'var(--text-white)' : 'var(--text-primary)',
                boxShadow: selected === r.id ? 'var(--shadow-subtle)' : 'none',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="px-6 pt-4 pb-6">
          <button
            onClick={() => selected && setCurrentReviewer(selected)}
            disabled={!selected}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--acfs-navy)', color: 'var(--text-white)' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
