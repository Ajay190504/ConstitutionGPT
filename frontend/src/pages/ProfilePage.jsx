import { useState } from 'react'
import ApiService from '../services/api'

export default function ProfilePage({ user, onLogout }) {
  const isLawyer = user?.role === 'lawyer';

  // Password State
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [paLoading, setPaLoading] = useState(false);
  const [paError, setPaError] = useState('');
  const [paSuccess, setPaSuccess] = useState('');

  // Profile Edit State (for lawyers)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || '',
    specialization: user?.specialization || '',
    years_of_experience: user?.years_of_experience || 0,
    consultation_fee: user?.consultation_fee || 0
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPaError('');
    setPaSuccess('');

    const passwordError = validatePassword(passwordData.new);
    if (passwordError) {
      setPaError(passwordError);
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPaError('New passwords do not match');
      return;
    }

    setPaLoading(true);
    try {
      await ApiService.changePassword(passwordData.current, passwordData.new);
      setPaSuccess('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPaError(err.message || 'Failed to update password');
    } finally {
      setPaLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setEditLoading(true);

    try {
      const resp = await ApiService.updateLawyerProfile(editData);
      if (resp.success) {
        setEditSuccess('Professional details updated!');
        setIsEditing(false);
        // Sync local storage so navigation & other pages reflect changes
        const currentTokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        localStorage.setItem('user', JSON.stringify(resp.user));
        // Refresh page to sync all components
        window.location.reload();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-8">
          {/* Main Identity Card */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-primary text-white py-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <h4 className="mb-0 text-center">User Profile</h4>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="bg-light text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h3>{user?.username}</h3>
                <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : isLawyer ? 'bg-success' : 'bg-info'}`}>
                  {user?.role?.toUpperCase()}
                </span>
                {isLawyer && (
                  <div className="mt-2">
                    {user?.is_verified ? (
                      <span className="text-success small fw-bold">
                        <i className="bi bi-patch-check-fill me-1"></i>Verified Professional
                      </span>
                    ) : (
                      <span className="text-warning small fw-bold">
                        <i className="bi bi-clock-history me-1"></i>Verification Pending
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-details">
                <div className="mb-3">
                  <label className="text-muted small text-uppercase fw-bold">Email Address</label>
                  <p className="fs-5 mb-0">{user?.email}</p>
                </div>

                {isLawyer && (
                  <>
                    <hr className="my-4" />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Professional Details</h5>
                      {!isEditing && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                          <i className="bi bi-pencil-square me-1"></i>Edit Details
                        </button>
                      )}
                    </div>

                    {editError && <div className="alert alert-danger">{editError}</div>}
                    {editSuccess && <div className="alert alert-success">{editSuccess}</div>}

                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Phone Number</label>
                            <input type="text" className="form-control" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">City</label>
                            <input type="text" className="form-control" value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Office Address</label>
                            <textarea className="form-control" rows="2" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })}></textarea>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Specialization</label>
                            <select className="form-select" value={editData.specialization} onChange={e => setEditData({ ...editData, specialization: e.target.value })}>
                              <option value="Criminal Law">Criminal Law</option>
                              <option value="Civil Law">Civil Law</option>
                              <option value="Family Law">Family Law</option>
                              <option value="Corporate Law">Corporate Law</option>
                              <option value="Constitutional Law">Constitutional Law</option>
                              <option value="Consumer Rights">Consumer Rights</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Exp (Years)</label>
                            <input type="number" className="form-control" value={editData.years_of_experience} onChange={e => setEditData({ ...editData, years_of_experience: parseInt(e.target.value) })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Fee (₹)</label>
                            <input type="number" className="form-control" value={editData.consultation_fee} onChange={e => setEditData({ ...editData, consultation_fee: parseFloat(e.target.value) })} />
                          </div>
                          <div className="col-12 mt-4 d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={editLoading}> {editLoading ? 'Saving...' : 'Save Changes'} </button>
                            <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>Cancel</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="row">
                        <div className="col-sm-6 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">Phone</label>
                          <p className="mb-0">{user?.phone || 'Not provided'}</p>
                        </div>
                        <div className="col-sm-6 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">City</label>
                          <p className="mb-0">{user?.city || 'Not provided'}</p>
                        </div>
                        <div className="col-12 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">Office Address</label>
                          <p className="mb-0">{user?.address || 'Not provided'}</p>
                        </div>
                        <div className="col-sm-4 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">Specialization</label>
                          <p className="mb-0">{user?.specialization || 'Not specified'}</p>
                        </div>
                        <div className="col-sm-4 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">Experience</label>
                          <p className="mb-0">{user?.years_of_experience || 0} Years</p>
                        </div>
                        <div className="col-sm-4 mb-3">
                          <label className="text-muted small text-uppercase fw-bold">Fee</label>
                          <p className="mb-0">₹{user?.consultation_fee || 0}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <h5 className="mb-3"><i className="bi bi-key-fill me-2 text-primary"></i>Change Password</h5>
              {paError && <div className="alert alert-danger py-2">{paError}</div>}
              {paSuccess && <div className="alert alert-success py-2">{paSuccess}</div>}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="Enter Current Password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label className="form-label small fw-bold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="New Password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                  <div className="col-sm-6 mb-3">
                    <label className="form-label small fw-bold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="Confirm New Password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary px-4" disabled={paLoading}>
                  {paLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-outline-danger" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
