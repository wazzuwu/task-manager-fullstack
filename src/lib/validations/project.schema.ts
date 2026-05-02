import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be under 100 characters'),
  description: z.string().max(500).optional(),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
