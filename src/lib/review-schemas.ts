import { z } from 'zod'

export const ReviewActionSchema = z.object({
  targetId: z.string().regex(/^[a-z_]+:.+$/, 'targetId must be in format "type:id"'),
  reviewerId: z.string().min(1),
  action: z.enum(['approve', 'dispute', 'resolve', 'defer']),
  comment: z.string().optional(),
})

export type ReviewAction = z.infer<typeof ReviewActionSchema>

export const ReviewerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(['designer', 'product_owner', 'tech_lead', 'engineer', 'qa']),
  focus: z.array(z.string()).min(1),
})
