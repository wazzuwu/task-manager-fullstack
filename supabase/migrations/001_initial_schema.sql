-- ============================================================
-- Team Task Manager — Initial Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ─────────────────────────────────────────
-- 0. ENUMS
-- ─────────────────────────────────────────
CREATE TYPE public.project_role   AS ENUM ('admin', 'member');
CREATE TYPE public.task_status    AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.task_priority  AS ENUM ('low', 'medium', 'high');


-- ─────────────────────────────────────────
-- 1. USERS (mirrors auth.users)
-- ─────────────────────────────────────────
CREATE TABLE public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT        NOT NULL DEFAULT 'New User',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);


-- ─────────────────────────────────────────
-- 2. PROJECTS
-- ─────────────────────────────────────────
CREATE TABLE public.projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description TEXT,
  owner_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_owner ON public.projects(owner_id);


-- ─────────────────────────────────────────
-- 3. PROJECT MEMBERS
-- ─────────────────────────────────────────
CREATE TABLE public.project_members (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID          NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID          NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  role        project_role  NOT NULL DEFAULT 'member',
  invited_by  UUID          REFERENCES public.users(id),
  joined_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_pm_project ON public.project_members(project_id);
CREATE INDEX idx_pm_user    ON public.project_members(user_id);


-- ─────────────────────────────────────────
-- 4. TASKS
-- ─────────────────────────────────────────
CREATE TABLE public.tasks (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID           NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT           NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  description  TEXT,
  status       task_status    NOT NULL DEFAULT 'todo',
  priority     task_priority  NOT NULL DEFAULT 'medium',
  assignee_id  UUID           REFERENCES public.users(id) ON DELETE SET NULL,
  created_by   UUID           NOT NULL REFERENCES public.users(id),
  due_date     DATE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_project  ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status   ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);


-- ─────────────────────────────────────────
-- 5. TASK ACTIVITY LOGS
-- ─────────────────────────────────────────
CREATE TABLE public.task_activity_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID        NOT NULL REFERENCES public.tasks(id)    ON DELETE CASCADE,
  project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id    UUID        NOT NULL REFERENCES public.users(id),
  action      TEXT        NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_task    ON public.task_activity_logs(task_id);
CREATE INDEX idx_logs_project ON public.task_activity_logs(project_id);


-- ─────────────────────────────────────────
-- 6. TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─────────────────────────────────────────
-- 7. TRIGGER: sync auth.users → public.users on signup
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- 8. TRIGGER: auto-add project creator as admin
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();


-- ─────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;


-- ── users ──────────────────────────────
CREATE POLICY "users_select_all" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);


-- ── projects ───────────────────────────
CREATE POLICY "projects_select_member" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "projects_insert_auth" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );

CREATE POLICY "projects_delete_admin" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );


-- ── project_members ────────────────────
CREATE POLICY "pm_select_member" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "pm_insert_admin" ON public.project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );

CREATE POLICY "pm_update_admin" ON public.project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );

CREATE POLICY "pm_delete_admin" ON public.project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );


-- ── tasks ──────────────────────────────
CREATE POLICY "tasks_select_member" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert_member" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_admin_or_assignee" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id
        AND pm.user_id = auth.uid()
        AND (pm.role = 'admin' OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "tasks_delete_admin" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );


-- ── task_activity_logs ─────────────────
CREATE POLICY "logs_select_member" ON public.task_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "logs_insert_member" ON public.task_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────
-- 10. DASHBOARD VIEW (convenience)
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.project_task_stats AS
SELECT
  t.project_id,
  COUNT(*)                                                              AS total_tasks,
  COUNT(*) FILTER (WHERE t.status = 'todo')                            AS todo_count,
  COUNT(*) FILTER (WHERE t.status = 'in_progress')                     AS in_progress_count,
  COUNT(*) FILTER (WHERE t.status = 'done')                            AS done_count,
  COUNT(*) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'done') AS overdue_count
FROM public.tasks t
GROUP BY t.project_id;
