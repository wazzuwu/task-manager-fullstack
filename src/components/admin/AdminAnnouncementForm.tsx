'use client'

import { useActionState } from 'react'
import { Megaphone, Loader2 } from 'lucide-react'
import { sendAnnouncementAction } from '@/app/actions/admin'

export function AdminAnnouncementForm({ users }: { users: any[] }) {
  const [state, formAction, isPending] = useActionState(sendAnnouncementAction, undefined)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-brand-500" />
        <h3 className="font-bold text-slate-900">Send Announcement</h3>
      </div>
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            Announcement sent successfully!
          </div>
        )}
        
        <div className="space-y-1.5">
          <label htmlFor="targetUserId" className="text-sm font-medium text-slate-700">To</label>
          <select
            id="targetUserId"
            name="targetUserId"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 transition-all"
          >
            <option value="all">Everyone (All Users)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            required
            placeholder="Type your announcement..."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
