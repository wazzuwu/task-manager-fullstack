# TaskFlow — Modern Team Task Manager

TaskFlow is a premium, full-stack task management application designed for seamless team collaboration. Built with **Next.js 15**, **Tailwind CSS 4**, and **Supabase**, it features real-time updates, drag-and-drop Kanban boards, and a fully responsive design.

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

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS-first approach)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand & React Query

## 📊 Database Schema

The project uses a relational PostgreSQL schema with Row Level Security (RLS) to ensure data integrity and privacy.

- **`users`**: Stores user profiles, synced automatically from Supabase Auth.
- **`projects`**: Core workspaces with names, descriptions, and owners.
- **`project_members`**: Join table managing project access and roles (`admin`, `member`).
- **`tasks`**: Task items including status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), and assignees.
- **`task_activity_logs`**: Tracks every action performed on a task for audit purposes.
- **`notifications`**: User-specific alerts for project and task activities.

## 🚂 Deployment on Railway

1. **Push to GitHub**: Push your repository to GitHub.
2. **Create Railway Project**: Connect your GitHub repo to a new Railway project.
3. **Environment Variables**: Add the following variables in the Railway dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `NEXT_PUBLIC_SITE_URL`: Your Railway production URL (e.g., `https://your-app.up.railway.app`).
4. **Supabase Configuration**:
   - Add your Railway URL to the **Redirect URLs** in Supabase Auth settings.
   - Ensure your database migrations are applied to the production instance.

## 💻 Local Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/yourusername/task-manager-fullstack.git
   cd task-manager-fullstack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## 🛡 Security (User Access)

- **RLS Policies**: Users can only see projects they are members of.
- **Admin Rights**: Only Project Admins can delete projects or manage team members.
- **Data Protection**: All API interactions happen via Secure Server Actions or authenticated Supabase clients.
