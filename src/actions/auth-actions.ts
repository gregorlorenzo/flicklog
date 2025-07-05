'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return redirect('/login?error=Email and password are required')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message)
        return redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6)

    if (!email || !password) {
        return redirect('/signup?error=Email and password are required')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error.message)
        return redirect('/signup?error=Could not sign up user')
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}