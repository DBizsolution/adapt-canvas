export const TYPE_COLORS: Record<string, string> = {
  entity: '#0081F2',
  actor: '#8B5CF6',
  journey: '#10B981',
  rule: '#F59E0B',
  constraint: '#EF4444',
  question: '#EC4899',
}

export const CARD_SIZES = {
  large:  { width: 8, height: 6 },
  medium: { width: 4, height: 3 },
  small:  { width: 2.5, height: 2 },
} as const

export const CANVAS_BG = '#F8F8F7'
export const FOG_COLOR = '#F0F0EE'
export const CONNECTION_DEFAULT_COLOR = '#D4D4D4'
export const CARD_OPACITY = 0.8
export const DEFERRED_OPACITY = 0.5

export const ANIMATION = {
  hoverScale: 1.05,
  transitionMs: 300,
  staggerMs: 80,
  stepThroughMs: 2000,
  particleSpeed: 0.008,
  orbitSpeed: 0.001,
} as const

export const ICON_MAP: Record<string, string> = {
  entity: 'database',
  actor: 'user',
  journey: 'route',
  rule: 'scale',
  constraint: 'shield-alert',
  question: 'circle-help',
}
