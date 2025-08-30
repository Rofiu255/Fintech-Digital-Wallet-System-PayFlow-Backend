import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your PayFlow account</p>
        <form onSubmit={onSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" type="submit">Sign in</button>
        </form>
        {error && <div className="error">{error}</div>}
        <div className="small">Don’t have an account? <Link to="/register">Create one</Link></div>
      </div>
    </div>
  )
}
