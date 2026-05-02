'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateTaskSchema, UpdateTaskSchema } from '@/lib/validations/task.schema'
import type { Task, TaskStatus } from '@/lib/types'

export async function getProjectTasksAction(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:users!tasks_assignee_id_fkey(id, full_name, avatar_url, email)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data
}

export async function createTaskAction(projectId: string, prevState: any, formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string || 'medium',
    status: formData.get('status') as string || 'todo',
  }

  const parsed = CreateTaskSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: { _form: ['Unauthorized'] } }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...parsed.data,
      project_id: projectId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { success: true, task: data as Task }
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task status:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTaskAction(taskId: string, projectId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { _form: ['Unauthorized'] } }

  const updates: Record<string, any> = {}
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const due_date = formData.get('due_date') as string

  if (title)       updates.title = title
  if (description !== null) updates.description = description || null
  if (priority)    updates.priority = priority
  updates.due_date = due_date || null

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) return { error: { _form: [error.message] } }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { success: true }
}
