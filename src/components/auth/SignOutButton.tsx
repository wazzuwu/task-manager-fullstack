'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton({ className }: { className?: string }) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className || "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors group text-sm text-left"}
    >
      {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  )
}
