import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ReviewerStore = {
  currentReviewerId: string | null
  setCurrentReviewer: (id: string) => void
}

export const useReviewerStore = create<ReviewerStore>()(
  persist(
    (set) => ({
      currentReviewerId: null,
      setCurrentReviewer: (id) => set({ currentReviewerId: id }),
    }),
    { name: 'reviewer-selection' }
  )
)
