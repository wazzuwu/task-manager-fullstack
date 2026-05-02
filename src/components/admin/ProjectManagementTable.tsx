'use client'

import { useState } from 'react'
import { FolderKanban, Users, ExternalLink, Shield } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  owner: {
    full_name: string
    email: string
  }
}

export function ProjectManagementTable({ initialProjects }: { initialProjects: Project[] }) {
  const [search, setSearch] = useState('')

  const filteredProjects = initialProjects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.owner.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50 font-medium border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{project.name}</p>
                      <p className="text-xs text-white/40 line-clamp-1 max-w-[200px]">{project.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/70">
                  {project.owner.full_name}
                </td>
                <td className="px-6 py-4 text-white/30">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    View Board <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
