DROP POLICY IF EXISTS "tasks_update_admin_or_assignee" ON public.tasks;

CREATE POLICY "tasks_update_member" ON public.tasks
  FOR UPDATE USING (
    project_id IN (SELECT get_my_projects())
  );
