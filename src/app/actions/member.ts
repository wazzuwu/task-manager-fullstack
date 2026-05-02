'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { InviteMemberSchema } from '@/lib/validations/member.schema'

export async function inviteMemberAction(projectId: string, prevState: any, formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    role: formData.get('role') as string || 'member',
  }

  const parsed = InviteMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // Find the user by email
  const { data: userToInvite, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', parsed.data.email)
    .single()

  if (userError || !userToInvite) {
    return { error: { _form: ['User with this email not found. They must sign up first.'] } }
  }

  // Add to project_members
  const { error: inviteError } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userToInvite.id,
      role: parsed.data.role,
    })

  if (inviteError) {
    if (inviteError.code === '23505') { // Unique violation
      return { error: { _form: ['User is already a member of this project.'] } }
    }
    return { error: { _form: [inviteError.message] } }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateMemberRoleAction(projectId: string, userId: string, newRole: 'admin' | 'member') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_members')
    .update({ role: newRole })
    .match({ project_id: projectId, user_id: userId })

  if (error) {
    console.error('Error updating member role:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function removeMemberAction(projectId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_members')
    .delete()
    .match({ project_id: projectId, user_id: userId })

  if (error) {
    console.error('Error removing member:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
