DROP POLICY IF EXISTS "projects_select_member" ON public.projects;

CREATE POLICY "projects_select_member" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT get_my_projects())
  );
