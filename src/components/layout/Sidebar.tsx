'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, FolderKanban, Shield, X } from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isAdmin: boolean
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
    }
  }
  onClose?: () => void
  className?: string
}

export function Sidebar({ isAdmin, user, onClose, className }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <aside className={cn("flex flex-col h-full bg-white border-r border-slate-200 shadow-sm", className)}>
      {/* Logo & Close button (mobile) */}
      <div className="py-6 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center justify-center flex-1">
          <div className="relative h-10 w-40">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-brand-50 text-brand-600 font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-brand-500" : "group-hover:text-brand-500")} />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0 ring-1 ring-brand-500/20">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        
        <SignOutButton className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all duration-200 group text-sm text-left" />
      </div>
    </aside>
  )
}
