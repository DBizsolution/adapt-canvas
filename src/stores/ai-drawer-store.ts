import { create } from 'zustand'
import type { ModelDiff } from '@/lib/model-diff'
import type { IntentModel } from '@/domain/intent-model/types'

type Proposal = {
  proposalId: string
  diff: ModelDiff
  proposedModel: IntentModel
  warnings: string[]
}

type DrawerStatus = 'idle' | 'loading' | 'diff_preview' | 'applying' | 'success' | 'error'

type DrawerState = {
  isOpen: boolean
  status: DrawerStatus
  scope: 'section' | 'full'
  currentProposal: Proposal | null
  error: string | null
  lastPrompt: string | null
  open: () => void
  close: () => void
  setScope: (scope: 'section' | 'full') => void
  setStatus: (status: DrawerStatus) => void
  setProposal: (proposal: Proposal | null) => void
  setError: (error: string | null) => void
  setLastPrompt: (prompt: string | null) => void
  reject: () => void
  reset: () => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  status: 'idle',
  scope: 'section',
  currentProposal: null,
  error: null,
  lastPrompt: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, status: 'idle', currentProposal: null, error: null }),
  setScope: (scope) => set({ scope }),
  setStatus: (status) => set({ status }),
  setProposal: (currentProposal) => set({ currentProposal }),
  setError: (error) => set({ error, status: 'error' }),
  setLastPrompt: (lastPrompt) => set({ lastPrompt }),
  reject: () => set({ status: 'idle', currentProposal: null }),
  reset: () => set({ status: 'idle', currentProposal: null, error: null }),
}))
