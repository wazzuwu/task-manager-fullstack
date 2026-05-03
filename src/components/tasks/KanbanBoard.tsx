'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/lib/types'
import { updateTaskStatusAction } from '@/app/actions/task'
import { createClient } from '@/lib/supabase/client'

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
  isAdmin: boolean
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export function KanbanBoard({ projectId, initialTasks, isAdmin }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // 1. Sync initial server loads
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // 2. Real-time Multiplayer Sync via Supabase Channels
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              // Avoid duplicates if we were the ones who just inserted it
              if (prev.some(t => t.id === payload.new.id)) return prev;
              return [payload.new as Task, ...prev]
            })
          }
          else if (payload.eventType === 'UPDATE') {
            setTasks((prev) => 
              prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t)
            )
          }
          else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start drag after 5px of movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)
    const overColumnId = over.data.current?.type === 'Column' ? over.id : overTask?.status

    if (!activeTask || !overColumnId) return

    // If moved to a different column, update it
    if (activeTask.status !== overColumnId) {
      const newStatus = overColumnId as TaskStatus

      // Optimistic update
      setTasks((prev) => 
        prev.map(t => t.id === activeId ? { ...t, status: newStatus } : t)
      )

      // Server update
      startTransition(async () => {
        const result = await updateTaskStatusAction(activeTask.id, newStatus, projectId)
        if (result.error) {
          // Revert on error
          console.error(result.error)
          setTasks(initialTasks)
        }
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-col md:flex-row gap-6 min-h-0 h-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex flex-col md:flex-row gap-6 min-w-full md:min-w-0 flex-1">

        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter((t) => t.status === col.id)}
            projectId={projectId}
            isAdmin={isAdmin}
          />
        ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} projectId={projectId} isAdmin={isAdmin} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
