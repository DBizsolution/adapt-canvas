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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#002C61] flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]">Who are you?</h2>
          <p className="text-sm text-[#64748B] mt-1">Select your name to start reviewing</p>
        </div>

        <div className="px-6 pb-2 space-y-2">
          {REVIEWERS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selected === r.id
                  ? 'bg-[#002C61] text-white shadow-md'
                  : 'bg-[#F5F6FA] text-[#334155] hover:bg-[#E8EAF0]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="px-6 pt-4 pb-6">
          <button
            onClick={() => selected && setCurrentReviewer(selected)}
            disabled={!selected}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all bg-[#0D9488] text-white hover:bg-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
