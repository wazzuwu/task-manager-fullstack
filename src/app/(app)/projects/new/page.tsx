'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProjectAction } from '@/app/actions/project'
import { Loader2, ArrowLeft, LayoutTemplate } from 'lucide-react'

type FieldErrors = {
  name?: string[]
  description?: string[]
  _form?: string[]
}

type ActionState = { error?: FieldErrors; success?: boolean; project?: any } | undefined

export default function NewProjectPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createProjectAction,
    undefined
  )

  useEffect(() => {
    if (state?.success && state.project?.id) {
      router.push(`/projects/${state.project.id}`)
    }
  }, [state, router])

  const errors = state?.error as FieldErrors | undefined

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Project</h1>
        <p className="text-white/50 mt-1">Set up a new workspace for your team.</p>
      </div>

      <div className="glass p-8 rounded-2xl">
        {errors?._form && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {errors._form[0]}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-white/70">
              Project Name <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <LayoutTemplate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Website Redesign"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
            {errors?.name && (
              <p className="text-xs text-red-400">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-white/70">
              Description <span className="text-white/30 font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="What is this project about?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-all resize-none"
            />
            {errors?.description && (
              <p className="text-xs text-red-400">{errors.description[0]}</p>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <Link 
              href="/projects"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || state?.success}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium text-sm transition-colors shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
