'use client'

import { useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, GripVertical, Trash2, Loader2 } from 'lucide-react'
import type { Task } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { deleteTaskAction } from '@/app/actions/task'
import { EditTaskDialog } from './EditTaskDialog'

interface TaskCardProps {
  task: Task
  projectId: string
  isAdmin: boolean
}

const priorityColors = {
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium: 'text-warning bg-warning/10 border-warning/20',
  high: 'text-danger bg-danger/10 border-danger/20',
}

export function TaskCard({ task, projectId, isAdmin }: TaskCardProps) {
  const [isDeleting, startDelete] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    startDelete(async () => {
      await deleteTaskAction(task.id, projectId)
    })
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="glass p-4 rounded-xl border-2 border-brand-500/50 opacity-50 h-32"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default shadow-sm border border-white/5 relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Action buttons — show on hover */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditTaskDialog task={task} projectId={projectId} />
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Delete task"
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <h4 className="text-sm font-semibold text-white mb-1 leading-snug">{task.title}</h4>
          
          {task.description && (
            <p className="text-xs text-white/50 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span title={new Date(task.created_at).toLocaleString()}>
                {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </span>
            </div>

            {task.assignee && (
              <div 
                className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold border border-[#1a1a26]"
                title={task.assignee.full_name}
              >
                {task.assignee.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
