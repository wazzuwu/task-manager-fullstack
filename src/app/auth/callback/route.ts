import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * This route handles the OAuth callback from Supabase/Google.
 * Supabase redirects here after the user authenticates.
 * We exchange the code for a session and redirect to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
