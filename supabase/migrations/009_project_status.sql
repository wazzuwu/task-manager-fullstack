-- 1. Create project status enum
DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('active', 'pending_approval', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add status, approved_by, approved_at columns to projects
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
        ALTER TABLE public.projects 
          ADD COLUMN status public.project_status NOT NULL DEFAULT 'active',
          ADD COLUMN approved_by UUID REFERENCES public.users(id),
          ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Trigger function: auto-set pending_approval when all tasks are done
CREATE OR REPLACE FUNCTION public.check_project_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks   INTEGER;
    done_tasks    INTEGER;
    proj_status   public.project_status;
BEGIN
    -- Only care about status changes on tasks
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get current project status
    SELECT status INTO proj_status FROM public.projects WHERE id = NEW.project_id;
    
    -- Don't touch already-approved/completed projects
    IF proj_status = 'completed' THEN
        RETURN NEW;
    END IF;

    -- Count total and done tasks for this project
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'done')
    INTO total_tasks, done_tasks
    FROM public.tasks
    WHERE project_id = NEW.project_id;

    -- If all tasks are done and there are tasks, mark pending approval
    IF total_tasks > 0 AND total_tasks = done_tasks THEN
        UPDATE public.projects 
        SET status = 'pending_approval', updated_at = now()
        WHERE id = NEW.project_id;
    ELSE
        -- If a task moves back from done, revert to active
        IF proj_status = 'pending_approval' THEN
            UPDATE public.projects 
            SET status = 'active', updated_at = now()
            WHERE id = NEW.project_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach trigger to tasks table
DROP TRIGGER IF EXISTS trg_check_project_completion ON public.tasks;
CREATE TRIGGER trg_check_project_completion
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.check_project_completion();

-- 5. Also handle task deletion
CREATE OR REPLACE FUNCTION public.check_project_completion_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks   INTEGER;
    done_tasks    INTEGER;
    proj_status   public.project_status;
BEGIN
    SELECT status INTO proj_status FROM public.projects WHERE id = OLD.project_id;
    IF proj_status = 'completed' THEN RETURN OLD; END IF;

    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'done')
    INTO total_tasks, done_tasks
    FROM public.tasks
    WHERE project_id = OLD.project_id AND id != OLD.id;

    IF total_tasks > 0 AND total_tasks = done_tasks THEN
        UPDATE public.projects SET status = 'pending_approval', updated_at = now() WHERE id = OLD.project_id;
    ELSE
        IF proj_status = 'pending_approval' THEN
            UPDATE public.projects SET status = 'active', updated_at = now() WHERE id = OLD.project_id;
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_project_completion_delete ON public.tasks;
CREATE TRIGGER trg_check_project_completion_delete
    AFTER DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.check_project_completion_on_delete();
