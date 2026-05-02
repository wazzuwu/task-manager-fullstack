import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Settings, Users, Plus } from 'lucide-react'
import { getProjectTasksAction } from '@/app/actions/task'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { MembersDialog } from '@/components/members/MembersDialog'
import type { Task } from '@/lib/types'

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        role,
        user:users!project_members_user_id_fkey (id, full_name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !project) {
    console.error("Project Fetch Error:", error)
    notFound()
  }

  const role = project.project_members?.[0]?.role
  const tasks = await getProjectTasksAction(project.id) as Task[]

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/projects"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
            <p className="text-white/50 text-sm mt-1">{project.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreateTaskDialog projectId={project.id} />

          <MembersDialog 
            projectId={project.id} 
            members={project.project_members as any} 
            currentUserRole={role as string}
            currentUserId={user!.id}
          />
          {role === 'admin' && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard 
          projectId={project.id} 
          initialTasks={tasks} 
          isAdmin={role === 'admin'} 
        />
      </div>
    </div>
  )
}
