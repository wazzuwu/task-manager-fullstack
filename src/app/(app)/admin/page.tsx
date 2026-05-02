import { getAllUsersAction, getAllProjectsAction, approveProjectAction, getComplaintsAction } from '@/app/actions/admin'
import { UserManagementTable } from '@/components/admin/UserManagementTable'
import { ProjectManagementTable } from '@/components/admin/ProjectManagementTable'
import { AdminAnnouncementForm } from '@/components/admin/AdminAnnouncementForm'
import { AdminComplaintsList } from '@/components/admin/AdminComplaintsList'
import { Shield, Users, FolderKanban, CheckCircle2, Clock, Loader2, MessageSquareWarning } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata = {
  title: 'System Admin Dashboard | TaskFlow',
}

async function ApproveButton({ projectId }: { projectId: string }) {
  async function handleApprove() {
    'use server'
    await approveProjectAction(projectId)
  }
  return (
    <form action={handleApprove}>
      <button
        type="submit"
        className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-semibold shadow-sm"
      >
        <CheckCircle2 className="w-4 h-4" />
        Approve Project
      </button>
    </form>
  )
}

export default async function AdminDashboardPage() {
  const users = await getAllUsersAction()
  const projects = await getAllProjectsAction()
  const complaints = await getComplaintsAction()

  const pendingProjects = projects.filter((p: any) => p.status === 'pending_approval')
  const completedProjects = projects.filter((p: any) => p.status === 'completed')
  const activeProjects = projects.filter((p: any) => p.status === 'active')

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Admin</h1>
          <p className="text-slate-500 mt-1">Manage users, projects, and communications.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Active Projects</p>
          <p className="text-3xl font-bold text-slate-900">{activeProjects.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold text-amber-500">{pendingProjects.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Open Complaints</p>
          <p className="text-3xl font-bold text-red-500">{complaints.filter((c:any) => c.status === 'open').length}</p>
        </div>
      </div>

      {/* ─── Communications & Complaints ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminAnnouncementForm users={users} />
        <AdminComplaintsList complaints={complaints} />
      </div>

      {/* ─── Pending Approval ─── */}
      {pendingProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Pending Your Approval</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{pendingProjects.length}</span>
          </div>
          <div className="space-y-3">
            {pendingProjects.map((project: any) => (
              <div key={project.id} className="bg-white rounded-2xl p-5 border-2 border-amber-200 shadow-sm flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-500">
                      Owned by <span className="font-medium">{project.owner?.full_name || project.owner?.email}</span>
                      {' · '}All tasks complete · {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/projects/${project.id}`} className="text-sm text-brand-600 hover:underline font-medium">
                    View Board
                  </Link>
                  <ApproveButton projectId={project.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── User & Project Management ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-900">User Access Control</h3>
          </div>
          <UserManagementTable initialUsers={users as any} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <FolderKanban className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-900">Global Project Overview</h3>
          </div>
          <ProjectManagementTable initialProjects={projects as any} />
        </div>
      </div>
    </div>
  )
}

