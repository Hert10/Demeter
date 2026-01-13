'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from  '../../utils/supabase/client'
import { redirect } from 'next/dist/server/api-utils'

export default function AccountForm({ user }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState(null)
  const [username, setUsername] = useState(null)
 

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)

      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({ username }) {
    try {
      setLoading(true)
  
      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        full_name: fullname,
        username,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
    <div className="card shadow-sm border-success">
      <div className="card-header bg-success text-white">
        <h3 className="mb-0">Account Settings</h3>
      </div>
      <div className="card-body">
        <form className="form-widget" onSubmit={(e) => {
          e.preventDefault();
          updateProfile({ fullname, username });
        }}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-success fw-bold">Email</label>
            <input 
              id="email" 
              type="text" 
              className="form-control border-success" 
              value={user?.email} 
              disabled 
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label text-success fw-bold">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="form-control border-success"
              value={fullname || ''}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="username" className="form-label text-success fw-bold">Username</label>
            <input
              id="username"
              type="text"
              className="form-control border-success"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
  
          <div className="d-grid gap-2 mb-4">
            <button
              className="btn btn-success"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : 'Update Profile'}
            </button>
          </div>
        </form>
  
        <div className="border-top pt-3">
          <form action="/dashboard">
            <button className="btn btn-outline-success w-100">
             Back to Dashboard
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-muted">Manage your account information</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}