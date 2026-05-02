'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/lib/types'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  projectId: string
  isAdmin: boolean
}

export function KanbanColumn({ id, title, tasks, projectId, isAdmin }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
    },
  })

  return (
    <div className="flex flex-col h-full bg-surface-1/50 rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-2/50">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/50">
          {tasks.length}
        </span>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto space-y-3"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} isAdmin={isAdmin} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-white/30 font-medium">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
