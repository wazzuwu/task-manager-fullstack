DROP POLICY IF EXISTS "logs_select_member" ON public.task_activity_logs;

CREATE POLICY "logs_select_member" ON public.task_activity_logs
  FOR SELECT USING (
    project_id IN (SELECT get_my_projects())
  );

CREATE OR REPLACE FUNCTION public.log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.task_activity_logs (
      task_id, project_id, actor_id, action, old_value, new_value
    ) VALUES (
      NEW.id, NEW.project_id, auth.uid(), 'status_changed', 
      jsonb_build_object('status', OLD.status), 
      jsonb_build_object('status', NEW.status)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_activity_logs (
      task_id, project_id, actor_id, action, new_value
    ) VALUES (
      NEW.id, NEW.project_id, auth.uid(), 'created', 
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_task_activity ON public.tasks;
CREATE TRIGGER trg_task_activity
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_task_activity();
