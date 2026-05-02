'use client'

import { useState } from 'react'
import { MessageSquareWarning, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { resolveComplaintAction } from '@/app/actions/admin'
import { formatDistanceToNow } from 'date-fns'

export function AdminComplaintsList({ complaints }: { complaints: any[] }) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const openComplaints = complaints.filter(c => c.status === 'open')
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved')

  async function handleResolve(e: React.FormEvent<HTMLFormElement>, complaintId: string, userId: string) {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const message = formData.get('replyMessage') as string
    
    await resolveComplaintAction(complaintId, userId, message)
    
    setIsPending(false)
    setReplyingTo(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900">User Complaints</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
          {openComplaints.length} Open
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {openComplaints.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No open complaints right now.
          </div>
        )}
        
        {openComplaints.map(complaint => (
          <div key={complaint.id} className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">{complaint.subject}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  From: {complaint.user?.full_name} ({complaint.user?.email}) · {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700">
              {complaint.message}
            </div>

            {replyingTo === complaint.id ? (
              <form onSubmit={(e) => handleResolve(e, complaint.id, complaint.user_id)} className="space-y-3 pt-2">
                <textarea
                  name="replyMessage"
                  rows={2}
                  required
                  placeholder="Type your reply to resolve this issue..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-500 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Reply & Resolve
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setReplyingTo(complaint.id)}
                  className="text-sm text-brand-600 font-medium hover:underline"
                >
                  Reply & Resolve
                </button>
              </div>
            )}
          </div>
        ))}

        {resolvedComplaints.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recently Resolved</h4>
            <div className="space-y-2">
              {resolvedComplaints.slice(0, 5).map(complaint => (
                <div key={complaint.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate pr-4">{complaint.subject}</span>
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
