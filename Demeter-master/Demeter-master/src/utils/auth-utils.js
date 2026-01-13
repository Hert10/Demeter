import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export async function getUserSession() {
    const supabase = await createClient();
  
    const { data: sessionData, error } = await supabase.auth.getSession();
  
    if (error) {
      console.error('Error getting session:', error);
      return { data: { user: null }, error };
    }
  
    const user = sessionData?.session?.user || null;
    return { data: { user }, error: null };
  }
  

export async function protect(){
    const{data: {user}} = await getUserSession()
    if(!user){redirect('/login')}
    const supabase = await createClient();
    const{data: profile, error: profileError} = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .single();
    if(profileError){
        console.log('error fetching profile', profileError);
    }
    return{user: {
        ...user,
        username: profile?.username || 'User',
        full_name: profile?.full_name || 'User'
    }}
}