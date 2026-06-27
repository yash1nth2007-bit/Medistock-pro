import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Key, ArrowLeft, Shield } from 'lucide-react'
import Swal from 'sweetalert2'

const Login = () => {
  const [mode, setMode] = useState('signin') // 'signin' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const user = localStorage.getItem('medistock_user')
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const validateEmail = (emailVal) => {
    return /\S+@\S+\.\S+/.test(emailVal)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email address is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      setLoading(false)
      const credentials = [
        { email: 'bakkathatlashiva@gmail.com', password: 'Shiva@123', role: 'Super Admin', name: 'Shiva Bakkathatla' }
      ]

      const matchedUser = credentials.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      )

      if (matchedUser) {
        localStorage.setItem(
          'medistock_user',
          JSON.stringify({
            email: matchedUser.email,
            role: matchedUser.role,
            name: matchedUser.name
          })
        )
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: `Logged in successfully as ${matchedUser.role}`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/dashboard')
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sign In Failed',
          text: 'Invalid email or password. Please try again.'
        })
      }
    }, 800)
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email address is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      Swal.fire({
        icon: 'success',
        title: 'Reset Link Sent',
        text: `Instructions to reset your password have been sent to ${email}`,
        confirmButtonColor: 'var(--color-secondary)'
      }).then(() => {
        setMode('signin')
        setPassword('')
      })
    }, 800)
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Shield size={28} style={{ color: '#fff' }} />
          </div>
          <h1>MediStock Pro</h1>
          <p>Enterprise Healthcare Management Platform</p>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="name@medistock.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setErrors({})
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Sign In'}
            </button>


          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="name@medistock.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
              <div className="form-hint">Enter your email and we'll send you instructions to reset your password.</div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Reset Link'}
            </button>

            <button
              type="button"
              className="btn btn-ghost w-full"
              style={{ marginTop: 12, gap: 6 }}
              onClick={() => {
                setMode('signin')
                setErrors({})
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
