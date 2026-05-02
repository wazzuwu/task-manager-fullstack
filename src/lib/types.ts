// ─────────────────────────────────────────
// Database entity types (mirrors Supabase schema)
// ─────────────────────────────────────────

export type ProjectRole   = 'admin' | 'member'
export type TaskStatus    = 'todo' | 'in_progress' | 'done'
export type TaskPriority  = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'pending_approval' | 'completed'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  owner_id: string
  status: ProjectStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectRole
  invited_by: string | null
  joined_at: string
  // Joined fields
  user?: User
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
  // Joined fields
  assignee?: User | null
  creator?: User
}

export interface TaskActivityLog {
  id: string
  task_id: string
  project_id: string
  actor_id: string
  action: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  created_at: string
  // Joined fields
  actor?: User
}

// ─────────────────────────────────────────
// Dashboard / API response types
// ─────────────────────────────────────────

export interface ProjectStats {
  total_tasks: number
  todo_count: number
  in_progress_count: number
  done_count: number
  overdue_count: number
}

export interface AssigneeStats {
  user_id: string
  full_name: string
  avatar_url: string | null
  task_count: number
}

export interface ProjectDashboard {
  project: Project
  stats: ProjectStats
  by_assignee: AssigneeStats[]
  members: ProjectMember[]
}

// ─────────────────────────────────────────
// API response wrapper
// ─────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
