-- 1. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id OR is_system_admin());

CREATE POLICY "Users can insert own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (is_system_admin());

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR is_system_admin());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id OR is_system_admin());

CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (is_system_admin() OR auth.uid() = sender_id);

-- 3. Trigger: New User Welcome Notification
-- Note: auth.users insert triggers are tricky in Supabase because public.users is often updated after.
-- Since we rely on public.users, we'll attach the trigger to public.users.

CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
        NEW.id, 
        'Welcome to Ethara.AI!', 
        'Ethara.AI welcomes you! We are excited to have you on board. Start by creating a project or exploring your dashboard.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user_welcome ON public.users;
CREATE TRIGGER trg_new_user_welcome
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.send_welcome_notification();

-- Grant trigger function permissions
GRANT EXECUTE ON FUNCTION public.send_welcome_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_welcome_notification() TO service_role;
