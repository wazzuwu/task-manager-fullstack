# TaskFlow — Modern Team Task Manager

TaskFlow is a premium, full-stack task management application designed for seamless team collaboration. Built with **Next.js 16**, **Tailwind CSS 4**, and **Supabase**, it features real-time updates, drag-and-drop Kanban boards, and a fully responsive design.

![TaskFlow Logo](public/logo.png)

## 🚀 Key Features

- **Real-time Collaboration**: Instant sync across all clients using Supabase Realtime.
- **Interactive Kanban Board**: Smooth drag-and-drop task management powered by `@dnd-kit`.
- **Comprehensive Auth**: Secure login via Google OAuth and traditional Email/Password.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (Admin/Member) implemented at the database level via Supabase RLS.
- **Project Workspaces**: Manage multiple projects, each with its own set of members and tasks.
- **Activity Logs**: Full audit trail of task changes (status updates, reassignments, etc.).
- **Premium Responsive UI**: A sleek, modern interface that works perfectly on mobile and desktop.
- **Notifications**: Stay updated with task assignments and project changes.

## 🛠 Tech Stack

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS-first approach)
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres, SSR, Realtime)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand & React Query

## 📊 Database Schema (In-Depth)

The project uses a highly relational PostgreSQL schema optimized for speed and data integrity, protected by Supabase Row Level Security (RLS).

- **`users`**: Stores user profiles. Linked to Supabase Auth. Automatically synced via triggers on signup.
- **`projects`**: Core workspaces. RLS ensures only project members can view their projects.
- **`project_members`**: Junction table for user-project relationships. Roles include `admin` (can manage settings/members) and `member` (standard access).
- **`tasks`**: Task items with `todo`, `in_progress`, and `done` statuses. Priority levels (`low`, `medium`, `high`) are enforced via enums.
- **`task_activity_logs`**: Immutable audit trail using JSONB to track changes to task fields.
- **`notifications`**: Real-time alerts for user assignments and status updates.
- **`system_admin_roles`**: Global administrative access for platform management.

## 💻 Local Setup Guide

Follow these steps to run TaskFlow on your local machine:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher.
- **Supabase Account**: A project on [Supabase.com](https://supabase.com/).

### 2. Installation
```bash
git clone https://github.com/yourusername/task-manager-fullstack.git
cd task-manager-fullstack
npm install
```

### 3. Database Initialization
1. Create a new project in the **Supabase Dashboard**.
2. Navigate to the **SQL Editor**.
3. Copy and run the scripts from the `supabase/migrations/` folder in sequential order (001 to 010). This will set up the tables, triggers, and RLS policies.

### 4. Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Running the App
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

## 🚂 Deployment (Railway)

1. **Push to GitHub**: Push your repository to a GitHub account.
2. **Railway Project**: Connect your GitHub repo to a new Railway project.
3. **Environment Variables**: Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in the Railway dashboard.
4. **Supabase Redirects**: Add your production Railway URL to the **Redirect URLs** in **Supabase Auth -> Settings**.

## 🛡 Security & Access Control

- **RLS Policies**: Data is protected at the database level. Users can never fetch data for projects they aren't part of.
- **Server Actions**: All mutations happen via secure Next.js Server Actions with server-side validation.
- **Admin Privileges**: Sensitive operations like member removal or project deletion are restricted to `admin` roles.
