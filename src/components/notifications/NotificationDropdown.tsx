'use client'

import { useState, useEffect } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Bell, CheckCircle2, Info, Clock } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/notification'

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Fetch notifications initially and whenever dropdown opens
    if (isOpen) {
      loadNotifications()
    } else {
      // Also load initially to get unread count
      loadNotifications()
    }
  }, [isOpen])

  async function loadNotifications() {
    const data = await getNotificationsAction()
    setNotifications(data)
  }

  async function handleMarkRead(id: string) {
    await markNotificationReadAction(id)
    await loadNotifications()
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction()
    await loadNotifications()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          align="end" 
          sideOffset={8}
          className="z-50 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-500">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div key={notif.id} className={`p-4 flex gap-3 ${notif.is_read ? 'opacity-60 bg-slate-50/50' : 'bg-white'}`}>
                  {/* Icon/Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {notif.sender ? (
                      notif.sender.avatar_url ? (
                        <Image src={notif.sender.avatar_url} alt="Avatar" width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-600 font-bold text-xs">
                          {notif.sender.full_name[0].toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                        {notif.title}
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                      {!notif.is_read && (
                        <button 
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] text-brand-600 font-medium hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
