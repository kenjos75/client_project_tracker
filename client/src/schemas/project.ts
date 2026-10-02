import { z } from 'zod'
import { PRIORITIES, STATUSES } from '@/constants'

export const projectSchema = z
  .object({
    client_name: z.string().trim().min(1, 'Client name is required.').max(255, 'Client name is too long.'),
    project_name: z.string().trim().min(1, 'Project name is required.').max(255, 'Project name is too long.'),
    description: z.string(),
    status: z.enum(STATUSES, { message: 'Status must be one of: Planning, In Progress, On Hold, Completed.' }),
    priority: z.enum(PRIORITIES, { message: 'Priority must be one of: Low, Medium, High.' }),
    start_date: z.string().min(1, 'Start date is required.'),
    due_date: z.string().min(1, 'Due date is required.'),
  })
  .refine((v) => !v.start_date || !v.due_date || v.due_date >= v.start_date, {
    message: 'Due date cannot be earlier than the start date.',
    path: ['due_date'],
  })

export type ProjectInput = z.infer<typeof projectSchema>