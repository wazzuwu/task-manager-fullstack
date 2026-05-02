'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema, UpdateProjectSchema } from '@/lib/validations/project.schema'
import type { Project } from '@/lib/types'

export async function createProjectAction(prevState: any, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  }

  const parsed = CreateProjectSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: { _form: ['Unauthorized'] } }
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return { error: { _form: ['Only admins can create projects.'] } }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath('/projects')
  return { success: true, project: data as Project }
}

export async function getProjectsAction() {
  const supabase = await createClient()
  
  // Note: RLS ensures we only get projects we are a member of
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members!inner (role)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data
}
