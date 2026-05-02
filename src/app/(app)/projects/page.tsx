import { getProjectsAction } from '@/app/actions/project'
import { createClient } from '@/lib/supabase/server'
import { FolderKanban, Plus, MoreVertical, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function ProjectsPage() {
  const projects = await getProjectsAction() || []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()
    
  const isAdmin = userData?.role === 'admin'
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-white/50 mt-1">Manage all your team's projects.</p>
        </div>
        
        {isAdmin && (
          <Link 
            href="/projects/new" 
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/25"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass p-16 rounded-2xl text-center border-dashed">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {isAdmin ? 'No projects found' : 'No project assigned'}
          </h3>
          <p className="text-white/50 mb-8 max-w-md mx-auto text-lg">
            {isAdmin 
              ? "You don't have any projects yet. Create one to get started." 
              : "You haven't been assigned to any projects yet. Please contact your administrator."}
          </p>
          {isAdmin && (
            <Link 
              href="/projects/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="glass p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-6 h-6 text-brand-400" />
                  </div>
                  <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="font-bold text-white text-xl mb-2">{project.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-6 flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border border-[#1a1a26] bg-brand-500 flex items-center justify-center text-[10px] font-bold">
                        U
                      </div>
                    </div>
                    <span className="text-xs font-medium text-white/40">
                      {project.project_members?.[0]?.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/30">
                    {formatDistanceToNow(new Date(project.created_at))} ago
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
