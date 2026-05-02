import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, FolderKanban, Shield } from 'lucide-react'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { SettingsDropdown } from '@/components/settings/SettingsDropdown'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userData?.role === 'admin'

  return (
    <div className="flex h-screen bg-surface-1">
      {/* Sidebar */}
      <aside className="w-60 border-r border-slate-200 bg-white flex flex-col shadow-sm">
        {/* Logo only — no text */}
        <div className="py-6 flex items-center justify-center px-4 border-b border-slate-100">
          <Image src="/logo.png" alt="Logo" width={200} height={200} className="object-contain w-full max-w-[200px]" />
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors group">
            <LayoutDashboard className="w-4 h-4 group-hover:text-brand-500 transition-colors" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors group">
            <FolderKanban className="w-4 h-4 group-hover:text-brand-500 transition-colors" />
            <span className="text-sm font-medium">Projects</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors group">
              <Shield className="w-4 h-4 group-hover:text-brand-500 transition-colors" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          
          <SignOutButton className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors group text-sm text-left" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-8 border-b border-slate-200 bg-white shadow-sm z-10">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <SettingsDropdown />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-surface-1">
          {children}
        </div>
      </main>
    </div>
  )
}
