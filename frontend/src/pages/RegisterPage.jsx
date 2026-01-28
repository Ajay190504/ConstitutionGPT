import { useState } from 'react'
import ApiService from '../services/api'

export default function RegisterPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    address: '',
    city: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all basic fields')
      return
    }

    if (formData.role === 'lawyer' && (!formData.phone || !formData.city)) {
      setError('Please provide phone and city for lawyer registration')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      await ApiService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.role,
        formData.phone,
        formData.address,
        formData.city
      )
      // Auto-login after successful registration
      const loginResponse = await ApiService.login(formData.username, formData.password)
      onLogin(loginResponse.user)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: 500, width: '100%', borderRadius: '15px' }}>
        <h3 className="mb-3 text-center">Create Account</h3>
        <p className="text-muted text-center mb-4">Join ConstitutionGPT community</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Register as</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleUser" value="user" checked={formData.role === 'user'} onChange={handleChange} />
                <label className="form-check-label" htmlFor="roleUser">User</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleLawyer" value="lawyer" checked={formData.role === 'lawyer'} onChange={handleChange} />
                <label className="form-check-label" htmlFor="roleLawyer">Lawyer</label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" name="username" value={formData.username} onChange={handleChange} disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
          </div>

          {formData.role === 'lawyer' && (
            <div className="lawyer-fields animate__animated animate__fadeIn">
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input className="form-control" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} placeholder="+91 ..." />
              </div>
              <div className="mb-3">
                <label className="form-label">City</label>
                <input className="form-control" name="city" value={formData.city} onChange={handleChange} disabled={loading} />
              </div>
              <div className="mb-3">
                <label className="form-label">Office Address</label>
                <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} disabled={loading} rows="2"></textarea>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} disabled={loading} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={loading} />
            </div>
          </div>

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-primary py-2 fw-bold" type="submit" disabled={loading} style={{ borderRadius: '8px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        <hr />
        <div className="text-center">
          <a href="/login" className="text-decoration-none">Already have an account? Login</a>
        </div>
      </div>
    </div>
  )
}
