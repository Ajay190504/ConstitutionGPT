import React, { useState } from 'react'
import ApiService from '../services/api'

export default function LoginPage({ onLogin }){
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
      ApiService.setToken(response.token)
      onLogin(response.user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{minHeight:'100vh'}}>
      <div className="card p-4" style={{maxWidth:420,width:'100%'}}>
        <h3 className="mb-3">Login to ConstitutionGPT</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input 
              className="form-control" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password"
              className="form-control" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
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
