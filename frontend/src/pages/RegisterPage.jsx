import React, { useState } from 'react'
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
    city: '',
    consultation_fee: 0,
    specialization: '',
    years_of_experience: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validatePassword = (pass) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasUpper) return "Password must contain at least one uppercase letter";
    if (!hasLower) return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecial) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all basic fields')
      return
    }

    if (formData.role === 'lawyer' && (!formData.phone || !formData.city || !formData.lawyer_id_proof || !formData.lawyer_proof_file || !formData.specialization)) {
      setError('Please provide phone, city, specialization, ID number, and a document proof for lawyer registration')
      return
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
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
        formData.city,
        formData.lawyer_id_proof,
        formData.lawyer_proof_file,
        Number(formData.consultation_fee),
        formData.specialization,
        Number(formData.years_of_experience)
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
        <form onSubmit={handleSubmit} className="needs-validation">
          <div className="mb-3">
            <label className="form-label fw-bold">Register as</label>
            <div className="d-flex gap-4">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleUser" value="user" checked={formData.role === 'user'} onChange={handleChange} />
                <label className="form-check-label" htmlFor="roleUser">Regular Citizen</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleLawyer" value="lawyer" checked={formData.role === 'lawyer'} onChange={handleChange} />
                <label className="form-check-label" htmlFor="roleLawyer">Legal Professional</label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input
                className={`form-control ${error && (!formData.username || error.toLowerCase().includes('username')) ? 'is-invalid' : ''}`}
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <div className="invalid-feedback">{error.toLowerCase().includes('username') ? error : 'Username is required'}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-control ${error && (!formData.email || !formData.email.includes('@') || error.toLowerCase().includes('email')) ? 'is-invalid' : ''}`}
                name="email"
                placeholder="yourname@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <div className="invalid-feedback">{error.toLowerCase().includes('email') ? error : 'Valid email is required'}</div>
            </div>
          </div>

          {formData.role === 'lawyer' && (
            <div className="lawyer-fields animate__animated animate__fadeIn p-3 bg-light rounded mb-3 border">
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  className={`form-control ${error && !formData.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. +91 9876543210"
                  required
                />
                <div className="invalid-feedback">Phone number is required for lawyers</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Practicing City</label>
                <input
                  className={`form-control ${error && !formData.city ? 'is-invalid' : ''}`}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. New Delhi"
                  required
                />
                <div className="invalid-feedback">City is required for lawyers</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Bar Council ID / Legal License</label>
                <input
                  className={`form-control ${error && !formData.lawyer_id_proof ? 'is-invalid' : ''}`}
                  name="lawyer_id_proof"
                  value={formData.lawyer_id_proof}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your legal license number"
                  required
                />
                <div className="invalid-feedback">Field is required</div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Fee (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Exp (Years)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Specialization</label>
                  <select
                    className={`form-select ${error && !formData.specialization ? 'is-invalid' : ''}`}
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Consumer Rights">Consumer Rights</option>
                  </select>
                  <div className="invalid-feedback">Specialization is required</div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Upload ID Card / Proof (Image or PDF)</label>
                <input
                  type="file"
                  className={`form-control ${error && !formData.lawyer_proof_file ? 'is-invalid' : ''}`}
                  name="lawyer_proof_file"
                  onChange={(e) => setFormData({ ...formData, lawyer_proof_file: e.target.files[0] })}
                  disabled={loading}
                  accept="image/*,.pdf"
                  required
                />
                <div className="invalid-feedback">Document proof is required</div>
                <small className="text-muted">Max size: 5MB</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Office Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  rows="2"
                  placeholder="Enter your full office address"
                ></textarea>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${error && (validatePassword(formData.password)) ? 'is-invalid' : ''}`}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <div className="invalid-feedback">{validatePassword(formData.password) || 'Password is required'}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-control ${error && (formData.password !== formData.confirmPassword) ? 'is-invalid' : ''}`}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <div className="invalid-feedback">Passwords do not match</div>
            </div>
          </div>

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-primary py-2 fw-bold shadow-sm" type="submit" disabled={loading} style={{ borderRadius: '8px' }}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating account...
                </>
              ) : 'Join Community'}
            </button>
          </div>
        </form>
        <hr />
        <div className="text-center">
          <a href="/login" className="text-decoration-none fw-bold">Already have an account? Login</a>
        </div>
      </div>
    </div>
  )
}
