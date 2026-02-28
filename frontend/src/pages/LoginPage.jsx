import React, { useState } from 'react'
import ApiService from '../services/api'

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await ApiService.login(formData.username, formData.password)
      onLogin(response.user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h3 className="mb-3">Login to ConstitutionGPT</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="needs-validation">
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className={`form-control ${error && !formData.username ? 'is-invalid' : ''}`}
              name="username"
              placeholder="Enter Username or Email"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {error && !formData.username && <div className="invalid-feedback">Username or email is required</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${error && !formData.password ? 'is-invalid' : ''}`}
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {error && !formData.password && <div className="invalid-feedback">Password is required</div>}
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        <hr />
        <div className="text-center">
          <a href="/register">Create an account</a>
        </div>
      </div>
    </div>
  )
}
