'use client'

import { useActionState } from 'react'
import { Settings, LogOut, MessageSquareWarning, Loader2, CheckCircle2 } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import { raiseComplaintAction } from '@/app/actions/settings'

export default function SettingsPage() {
  const [state, formAction, isPending] = useActionState(raiseComplaintAction, undefined)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and submit feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Raise Complaint Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareWarning className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Raise a Complaint</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            If you are experiencing issues or need help from an admin, submit a complaint below.
          </p>

          {state?.success ? (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-800">Complaint submitted successfully. An admin will review it shortly.</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {state.error}
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  required
                  placeholder="Brief summary of the issue"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
