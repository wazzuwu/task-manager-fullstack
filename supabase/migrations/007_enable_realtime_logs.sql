-- Enable real-time replication for the activity logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_activity_logs;
