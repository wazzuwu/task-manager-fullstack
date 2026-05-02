'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  id: string
  action: string
  old_value: any
  new_value: any
  created_at: string
  actor: {
    full_name: string
    avatar_url: string | null
  }
  task: {
    title: string
  }
  project: {
    id: string
    name: string
  }
}

interface RecentActivityListProps {
  initialActivities: Activity[]
}

export function RecentActivityList({ initialActivities }: RecentActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const supabase = createClient()

  useEffect(() => {
    // Sync with server props
    setActivities(initialActivities)
  }, [initialActivities])

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_activity_logs'
        },
        async (payload) => {
          // When a new log is inserted, we need to fetch the related user/task/project info
          // because the payload only contains raw column data.
          const { data: fullActivity, error } = await supabase
            .from('task_activity_logs')
            .select(`
              id,
              action,
              old_value,
              new_value,
              created_at,
              actor:users (full_name, avatar_url),
              task:tasks (title),
              project:projects (id, name)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && fullActivity) {
            setActivities((prev) => [fullActivity as any, ...prev].slice(0, 10))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (activities.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl text-center border-dashed">
        <p className="text-white/50 text-sm">No recent activity yet. Create or move a task to see it here!</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="divide-y divide-white/5">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                {activity.actor?.full_name.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm text-white">
                  <span className="font-semibold">{activity.actor?.full_name || 'System'}</span>
                  {activity.action === 'created' ? ' created task ' : ' moved task '}
                  <span className="font-semibold">{activity.task?.title || 'a deleted task'}</span>
                  {activity.action === 'status_changed' && activity.new_value?.status && (
                    <span className="text-white/50"> to {activity.new_value.status.replace('_', ' ')}</span>
                  )}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  in <Link href={`/projects/${activity.project?.id}`} className="text-brand-400 hover:underline">{activity.project?.name}</Link>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activity.action === 'status_changed' && activity.new_value?.status && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  activity.new_value.status === 'done' ? 'text-success bg-success/10 border-success/20' :
                  activity.new_value.status === 'in_progress' ? 'text-warning bg-warning/10 border-warning/20' :
                  'text-blue-400 bg-blue-400/10 border-blue-400/20'
                }`}>
                  {activity.new_value.status.replace('_', ' ')}
                </span>
              )}
              <span className="text-xs text-white/30 min-w-[80px] text-right">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
