'use client'

import { useActionState, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Users, X, Loader2, Mail, ShieldAlert, UserMinus } from 'lucide-react'
import { inviteMemberAction, removeMemberAction, updateMemberRoleAction } from '@/app/actions/member'

type Member = {
  role: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
}

interface MembersDialogProps {
  projectId: string
  members: Member[]
  currentUserRole: string
  currentUserId: string
}

export function MembersDialog({ projectId, members, currentUserRole, currentUserId }: MembersDialogProps) {
  const [open, setOpen] = useState(false)
  const isAdmin = currentUserRole === 'admin'
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const [inviteState, inviteAction, isInviting] = useActionState(
    inviteMemberAction.bind(null, projectId),
    undefined
  )

  // Reset form errors on open/close
  if (inviteState?.success && open) {
    inviteState.success = false
    const form = document.getElementById('invite-form') as HTMLFormElement
    form?.reset()
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return
    setIsUpdating(userId)
    await removeMemberAction(projectId, userId)
    setIsUpdating(null)
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member') {
    setIsUpdating(userId)
    await updateMemberRoleAction(projectId, userId, newRole)
    setIsUpdating(null)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
          <Users className="w-4 h-4" />
          Members
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass border border-white/10 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left shrink-0">
            <Dialog.Title className="text-xl font-bold leading-none tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              Project Members
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/50">
              Manage who has access to this project.
            </Dialog.Description>
          </div>

          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
              <form id="invite-form" action={inviteAction} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Invite via email address..."
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <select
                  name="role"
                  defaultValue="member"
                  className="w-28 px-3 py-2 bg-[#1a1a26] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex items-center justify-center min-w-[80px] px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                </button>
              </form>
              {inviteState?.error?._form && (
                <p className="text-xs text-red-400 mt-2 ml-1">{inviteState.error._form[0]}</p>
              )}
              {inviteState?.success && (
                <p className="text-xs text-success mt-2 ml-1">Member invited successfully!</p>
              )}
            </div>
          )}

          <div className="mt-4 overflow-y-auto pr-2 space-y-3">
            {members.map((member) => {
              const isMe = member.user.id === currentUserId
              
              return (
                <div key={member.user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold shrink-0">
                      {member.user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {member.user.full_name} {isMe && <span className="text-white/30 text-xs ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-white/50 truncate">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {member.role === 'admin' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <ShieldAlert className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {member.role === 'member' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/10">
                        Member
                      </span>
                    )}

                    {isAdmin && !isMe && (
                      <div className="flex items-center gap-1 ml-2">
                        {member.role === 'member' ? (
                          <button
                            onClick={() => handleRoleChange(member.user.id, 'admin')}
                            disabled={isUpdating === member.user.id}
                            className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(member.user.id, 'member')}
                            disabled={isUpdating === member.user.id}
                            className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          >
                            Remove Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.user.id)}
                          disabled={isUpdating === member.user.id}
                          className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors ml-1"
                          title="Remove from project"
                        >
                          {isUpdating === member.user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4 text-white" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
