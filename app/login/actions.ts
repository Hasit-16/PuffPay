
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        username: formData.get('username') as string,
    }

    const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    })

    if (error) {
        redirect('/login?error=Could not create user')
    }

    if (authData.user) {
        // CRITICAL: Insert into public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                username: data.username,
                email: data.email,
                avatar_url: '', // Default or fetch from gravatar if needed, leaving empty for now
                trust_score: 100
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Ideally we might want to rollback auth user creation or show specific error
            // For now, redirecting with error
            redirect('/login?error=User created but profile failed')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
