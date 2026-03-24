export const TYPE_COLORS: Record<string, string> = {
  entity: '#0081F2',     // ACFS blue — primary
  actor: '#7C3AED',      // Purple — deeper for better contrast
  journey: '#059669',    // Green — darker for readability
  rule: '#D97706',       // Amber — deeper for contrast
  constraint: '#DC2626', // Red — darker for visibility
  question: '#DB2777',   // Pink — deeper for contrast
}

export const CARD_SIZES = {
  large:  { width: 9, height: 6.5 },
  medium: { width: 5, height: 3.5 },
  small:  { width: 3, height: 2.25 },
} as const

export const CANVAS_BG = '#F8F8F7'
export const FOG_COLOR = '#EBEBEA'
export const CONNECTION_DEFAULT_COLOR = '#A3A3A3'
export const CONNECTION_ACTIVE_COLOR = '#0081F2'
export const CARD_OPACITY = 0.95          // Nearly solid for readability
export const DEFERRED_OPACITY = 0.65      // Still visible but clearly different

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
