import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-success">Welcome Back</h2>
            <p className="text-muted">Sign in to access your account</p>
          </div>

          <form>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input 
                type="email" 
                className="form-control" 
                id="email" 
                name="email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                id="password" 
                name="password"
                required
              />
              <div className="text-end mt-2">
                <a href="#" className="text-decoration-none text-success">Forgot password?</a>
              </div>
            </div>

            <button 
              formAction={login}
              className="btn btn-success w-100 py-2 mb-3"
            >
              Sign In
            </button>

            <button 
              formAction={signup}
              className="btn btn-outline-success w-100 py-2"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted">By continuing, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  )
}