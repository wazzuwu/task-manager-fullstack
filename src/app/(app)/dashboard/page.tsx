import { getProjectsAction } from '@/app/actions/project'
import { createClient } from '@/lib/supabase/server'
import { FolderKanban, Plus, Clock, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'

export default async function DashboardPage() {
  console.log('DEBUG - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING')
  console.log('DEBUG - KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING')

  const projects = await getProjectsAction() || []
  const supabase = await createClient()
  
  // Fetch all tasks the user has access to for stats
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')

  const allTasks = tasks || []
  
  // Fetch recent activity
  const { data: activities } = await supabase
    .from('task_activity_logs')
    .select(`
      id,
      action,
      old_value,
      new_value,
      created_at,
      actor:users (full_name, avatar_url),
      task:tasks (title),
      project:projects (id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentActivity = activities || []
  
  const totalProjects = projects.length
  const todoCount = allTasks.filter(t => t.status === 'todo').length
  const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length
  const doneCount = allTasks.filter(t => t.status === 'done').length
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-white/50 mt-1">Overview of your workspace and recent activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{totalProjects}</p>
              <p className="text-sm font-medium text-white/50">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Circle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{todoCount}</p>
              <p className="text-sm font-medium text-white/50">To Do</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{inProgressCount}</p>
              <p className="text-sm font-medium text-white/50">In Progress</p>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{doneCount}</p>
              <p className="text-sm font-medium text-white/50">Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          <Link 
            href="/projects/new" 
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
            <p className="text-white/50 mb-6 max-w-sm mx-auto">Create your first project to start organizing tasks and collaborating with your team.</p>
            <Link 
              href="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium transition-colors shadow-lg shadow-brand-500/25"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="glass p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-white/50 line-clamp-2 mb-4 h-10">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between text-xs font-medium text-white/40">
                    <span>{project.project_members?.[0]?.role === 'admin' ? 'Admin' : 'Member'}</span>
                    <span>Created {formatDistanceToNow(new Date(project.created_at))} ago</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <RecentActivityList initialActivities={recentActivity as any} />
      </div>
    </div>
  )
}
