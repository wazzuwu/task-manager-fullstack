-- Enable real-time replication for the tasks table so clients can subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
