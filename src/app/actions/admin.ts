'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Check if the current user is a system admin
 */
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return data?.role === 'admin'
}

export async function getAllUsersAction() {
  if (!await checkAdmin()) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserRoleAction(userId: string, role: 'admin' | 'user') {
  if (!await checkAdmin()) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function getAllProjectsAction() {
  if (!await checkAdmin()) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      owner:users!projects_owner_id_fkey (id, full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function assignUserToProjectAction(projectId: string, userId: string, role: 'admin' | 'member') {
  if (!await checkAdmin()) throw new Error('Unauthorized')

  const supabase = await createClient()
  
  // Upsert the membership
  const { error } = await supabase
    .from('project_members')
    .upsert({ 
      project_id: projectId, 
      user_id: userId, 
      role 
    }, { onConflict: 'project_id,user_id' })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function approveProjectAction(projectId: string) {
  if (!await checkAdmin()) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .update({ 
      status: 'completed',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getComplaintsAction() {
  if (!await checkAdmin()) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      user:users!complaints_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function resolveComplaintAction(complaintId: string, userId: string, replyMessage: string) {
  if (!await checkAdmin()) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Mark complaint as resolved
  const { error: updateError } = await supabase
    .from('complaints')
    .update({ status: 'resolved' })
    .eq('id', complaintId)

  if (updateError) return { error: updateError.message }

  // 2. Send notification to the user
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      sender_id: user.id,
      title: 'Response to your complaint',
      message: replyMessage
    })

  if (notifError) return { error: notifError.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function sendAnnouncementAction(prevState: any, formData: FormData) {
  if (!await checkAdmin()) return { error: 'Unauthorized' }

  const targetUserId = formData.get('targetUserId') as string
  const message = formData.get('message') as string

  if (!message) return { error: 'Message is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (targetUserId === 'all') {
    // Fetch all users to send notifications
    const { data: users, error: fetchError } = await supabase.from('users').select('id')
    if (fetchError) return { error: fetchError.message }

    const notifications = users.map(u => ({
      user_id: u.id,
      sender_id: user.id,
      title: 'Admin Announcement',
      message
    }))

    const { error: insertError } = await supabase.from('notifications').insert(notifications)
    if (insertError) return { error: insertError.message }

  } else {
    // Single user
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        sender_id: user.id,
        title: 'Admin Message',
        message
      })
    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

