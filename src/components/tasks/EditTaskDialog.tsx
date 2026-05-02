'use client'

import { useActionState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Pencil, X, Loader2 } from 'lucide-react'
import { updateTaskAction } from '@/app/actions/task'
import type { Task } from '@/lib/types'

interface EditTaskDialogProps {
  task: Task
  projectId: string
}

export function EditTaskDialog({ task, projectId }: EditTaskDialogProps) {
  const boundAction = updateTaskAction.bind(null, task.id, projectId)
  const [state, formAction, isPending] = useActionState(boundAction, undefined)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if ((state as any)?.success) {
      closeRef.current?.click()
    }
  }, [state])

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500/20"
          title="Edit task"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 focus:outline-none">

          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-bold text-slate-900">Edit Task</Dialog.Title>
            <Dialog.Close ref={closeRef} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {(state as any)?.error?._form && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {(state as any).error._form[0]}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="edit-title" className="text-sm font-medium text-slate-700">Title</label>
              <input
                id="edit-title"
                name="title"
                type="text"
                defaultValue={task.title}
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="edit-description" className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                id="edit-description"
                name="description"
                rows={3}
                defaultValue={task.description || ''}
                placeholder="Optional description…"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-1.5">
                <label htmlFor="edit-priority" className="text-sm font-medium text-slate-700">Priority</label>
                <select
                  id="edit-priority"
                  name="priority"
                  defaultValue={task.priority}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label htmlFor="edit-due-date" className="text-sm font-medium text-slate-700">Due Date</label>
                <input
                  id="edit-due-date"
                  name="due_date"
                  type="date"
                  defaultValue={task.due_date || ''}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
