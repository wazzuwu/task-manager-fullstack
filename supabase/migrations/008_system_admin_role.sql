-- 1. Create the system role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.system_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add the role column to users (default to 'user')
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role public.system_role NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- 3. Create a helper function to check if the current user is a system admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role public.system_role;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS Policies to allow System Admins to bypass restrictions

-- PROJECTS
DROP POLICY IF EXISTS "projects_select_member" ON public.projects;
CREATE POLICY "projects_select_member" ON public.projects
  FOR SELECT USING (
    id IN (SELECT get_my_projects()) OR is_system_admin()
  );

DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (
    is_project_admin(id) OR is_system_admin()
  );

-- PROJECT MEMBERS
DROP POLICY IF EXISTS "pm_select_member" ON public.project_members;
CREATE POLICY "pm_select_member" ON public.project_members
  FOR SELECT USING (
    project_id IN (SELECT get_my_projects()) OR is_system_admin()
  );

-- TASKS
DROP POLICY IF EXISTS "tasks_select_member" ON public.tasks;
CREATE POLICY "tasks_select_member" ON public.tasks
  FOR SELECT USING (
    project_id IN (SELECT get_my_projects()) OR is_system_admin()
  );

DROP POLICY IF EXISTS "tasks_update_member" ON public.tasks;
CREATE POLICY "tasks_update_member" ON public.tasks
  FOR UPDATE USING (
    project_id IN (SELECT get_my_projects()) OR is_system_admin()
  );

-- TASK ACTIVITY LOGS
DROP POLICY IF EXISTS "logs_select_member" ON public.task_activity_logs;
CREATE POLICY "logs_select_member" ON public.task_activity_logs
  FOR SELECT USING (
    project_id IN (SELECT get_my_projects()) OR is_system_admin()
  );
