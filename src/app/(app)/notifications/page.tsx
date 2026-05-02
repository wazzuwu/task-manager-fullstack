import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/notification'
import { Bell, CheckCircle2, User, Info, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

export const metadata = {
  title: 'Notifications | TaskFlow',
}

async function MarkReadButton({ id }: { id: string }) {
  async function handleMarkRead() {
    'use server'
    await markNotificationReadAction(id)
  }
  return (
    <form action={handleMarkRead}>
      <button type="submit" className="text-xs text-brand-600 font-medium hover:underline">
        Mark as read
      </button>
    </form>
  )
}

async function MarkAllReadButton() {
  async function handleMarkAllRead() {
    'use server'
    await markAllNotificationsReadAction()
  }
  return (
    <form action={handleMarkAllRead}>
      <button type="submit" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4" />
        Mark all as read
      </button>
    </form>
  )
}

export default async function NotificationsPage() {
  const notifications = await getNotificationsAction()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 mt-1">Stay updated with activity and announcements.</p>
          </div>
        </div>
        {notifications.some((n: any) => !n.is_read) && (
          <MarkAllReadButton />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Bell className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-500 mt-1">You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-5 flex gap-4 ${notif.is_read ? 'opacity-70 bg-slate-50/50' : 'bg-white'}`}>
                {/* Icon/Avatar */}
                <div className="shrink-0 mt-1">
                  {notif.sender ? (
                    notif.sender.avatar_url ? (
                      <Image src={notif.sender.avatar_url} alt="Avatar" width={40} height={40} className="rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-600 font-bold text-sm">
                        {notif.sender.full_name[0].toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {notif.title}
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                      {!notif.is_read && <MarkReadButton id={notif.id} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
