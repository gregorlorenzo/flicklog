import { signout } from '@/actions/auth-actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold">Welcome to Flicklog!</h1>
      <p className="mt-2 text-muted-foreground">You are logged in as {user.email}</p>

      <form className="mt-8">
        <button
          formAction={signout}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}