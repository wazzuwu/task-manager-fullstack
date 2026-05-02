import { z } from 'zod'

export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'done'])
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high'])

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title must be under 200 characters'),
  description: z.string().max(2000).optional(),
  priority: TaskPriorityEnum.default('medium'),
  status: TaskStatusEnum.default('todo'),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.string().date().optional().nullable(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatusEnum.optional(),
})

export type TaskStatus = z.infer<typeof TaskStatusEnum>
export type TaskPriority = z.infer<typeof TaskPriorityEnum>
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
