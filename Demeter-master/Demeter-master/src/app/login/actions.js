'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../utils/supabase/server'
export async function login(formData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}


export async function signup(formData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp(data)
  
  if (signUpError) {
    redirect(`/error?message=${encodeURIComponent(signUpError.message)}`)
  }
  
  // Create a profile for the new user
  if (authData?.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      updated_at: new Date().toISOString(),
    })
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }
  
  redirect('/confirm_email')
}