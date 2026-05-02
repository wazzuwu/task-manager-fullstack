'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function raiseComplaintAction(prevState: any, formData: FormData) {
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!subject || !message) {
    return { error: 'Subject and message are required.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('complaints')
    .insert({
      user_id: user.id,
      subject,
      message,
    })

  if (error) return { error: error.message }

  // Notify all admins
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      sender_id: user.id,
      title: 'New Complaint Raised',
      message: `A new complaint has been submitted: "${subject}"`
    }))
    
    await supabase.from('notifications').insert(notifications)
  }

  revalidatePath('/settings')
  return { success: true }
}
