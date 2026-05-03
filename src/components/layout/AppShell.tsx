'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { Sidebar } from './Sidebar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { SettingsDropdown } from '@/components/settings/SettingsDropdown'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  isAdmin: boolean
  user: any
}

export function AppShell({ children, isAdmin, user }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on window resize if it's open and we switch to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar 
        isAdmin={isAdmin} 
        user={user} 
        className="hidden lg:flex lg:w-64 shrink-0" 
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          isAdmin={isAdmin} 
          user={user} 
          onClose={() => setIsSidebarOpen(false)}
          className="w-full border-r-0"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden h-8 w-px bg-slate-200 mx-1" />
            <div className="relative h-12 w-full max-w-[160px]">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown />
            <SettingsDropdown />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
