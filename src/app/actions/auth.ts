'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema, LoginSchema } from '@/lib/validations/auth.schema'

// ─── Sign Up ────────────────────────────────────────────────────────────────
export async function signUpAction(prevState: any, formData: FormData) {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
      },
    },
  })

  if (error) {
    return { error: { _form: [error.message] } }
  }

  redirect('/dashboard')
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function loginAction(prevState: any, formData: FormData) {
  console.log('SERVER ACTION DEBUG - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING')
  console.log('SERVER ACTION DEBUG - KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING')

  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: { _form: ['Invalid email or password.'] } }
  }

  redirect('/dashboard')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export async function signInWithGoogleAction() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = headersList.get('origin') || `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
