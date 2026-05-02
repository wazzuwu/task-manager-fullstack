'use client'

import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Settings, LogOut, MessageSquareWarning } from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'

export function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
          <Settings className="w-4 h-4" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          align="end" 
          sideOffset={8}
          className="z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        >
          <div className="flex flex-col">
            <Link 
              href="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <MessageSquareWarning className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Raise Complaint</span>
            </Link>
            
            <div className="h-px bg-slate-100" />
            
            <SignOutButton className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors text-left" />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
