-- Drop all existing policies that cause the infinite loop
DROP POLICY IF EXISTS "projects_select_member" ON public.projects;
DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_admin" ON public.projects;

DROP POLICY IF EXISTS "pm_select_member" ON public.project_members;
DROP POLICY IF EXISTS "pm_insert_admin" ON public.project_members;
DROP POLICY IF EXISTS "pm_update_admin" ON public.project_members;
DROP POLICY IF EXISTS "pm_delete_admin" ON public.project_members;

DROP POLICY IF EXISTS "tasks_select_member" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_member" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_admin_or_assignee" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;

DROP POLICY IF EXISTS "logs_select_member" ON public.task_activity_logs;
DROP POLICY IF EXISTS "logs_insert_member" ON public.task_activity_logs;

-- ─────────────────────────────────────────────────────────
-- Fix: Create a Security Definer function to fetch user's projects
-- This bypasses RLS and breaks the infinite recursion loop!
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_projects()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT project_id FROM project_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_project_admin(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = p_project_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
  );
$$;

-- ── projects ───────────────────────────
CREATE POLICY "projects_select_member" ON public.projects
  FOR SELECT USING (id IN (SELECT get_my_projects()));

CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (is_project_admin(id));

CREATE POLICY "projects_delete_admin" ON public.projects
  FOR DELETE USING (is_project_admin(id));

-- ── project_members ────────────────────
CREATE POLICY "pm_select_member" ON public.project_members
  FOR SELECT USING (project_id IN (SELECT get_my_projects()));

CREATE POLICY "pm_insert_admin" ON public.project_members
  FOR INSERT WITH CHECK (is_project_admin(project_id));

CREATE POLICY "pm_update_admin" ON public.project_members
  FOR UPDATE USING (is_project_admin(project_id));

CREATE POLICY "pm_delete_admin" ON public.project_members
  FOR DELETE USING (is_project_admin(project_id));

-- ── tasks ──────────────────────────────
CREATE POLICY "tasks_select_member" ON public.tasks
  FOR SELECT USING (project_id IN (SELECT get_my_projects()));

CREATE POLICY "tasks_insert_member" ON public.tasks
  FOR INSERT WITH CHECK (project_id IN (SELECT get_my_projects()));

CREATE POLICY "tasks_update_admin_or_assignee" ON public.tasks
  FOR UPDATE USING (
    project_id IN (SELECT get_my_projects()) AND
    (is_project_admin(project_id) OR assignee_id = auth.uid())
  );

CREATE POLICY "tasks_delete_admin" ON public.tasks
  FOR DELETE USING (is_project_admin(project_id));

-- ── task_activity_logs ─────────────────
CREATE POLICY "logs_select_member" ON public.task_activity_logs
  FOR SELECT USING (project_id IN (SELECT get_my_projects()));

CREATE POLICY "logs_insert_member" ON public.task_activity_logs
  FOR INSERT WITH CHECK (project_id IN (SELECT get_my_projects()));
