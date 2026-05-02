'use client'

import { useActionState, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X, Loader2 } from 'lucide-react'
import { createTaskAction } from '@/app/actions/task'

export function CreateTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    createTaskAction.bind(null, projectId),
    undefined
  )

  // Close dialog on success
  if (state?.success && open) {
    setOpen(false)
    state.success = false
  }

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
  const selectCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
  const labelCls = "text-sm font-medium text-slate-700"

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-semibold shadow-sm">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 focus:outline-none">
          
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-xl font-bold text-slate-900">Create Task</Dialog.Title>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-slate-500 mb-6">
            Add a new task to your project board.
          </Dialog.Description>

          <form action={formAction} className="space-y-4">
            {state?.error?._form && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {state.error._form[0]}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="title" className={labelCls}>
                Title <span className="text-brand-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="What needs to be done?"
                className={inputCls}
              />
              {state?.error?.title && <p className="text-xs text-red-500">{state.error.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className={labelCls}>Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Add more details..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className={labelCls}>Status</label>
                <select id="status" name="status" defaultValue="todo" className={selectCls}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="priority" className={labelCls}>Priority</label>
                <select id="priority" name="priority" defaultValue="medium" className={selectCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Creating…' : 'Create Task'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
