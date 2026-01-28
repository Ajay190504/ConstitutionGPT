import React from "react";
import React, { useState } from 'react'
import ApiService from '../services/api'

export default function ProfilePage({ user, onLogout }) {
  const isLawyer = user?.role === 'lawyer';
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [paLoading, setPaLoading] = useState(false);
  const [paError, setPaError] = useState('');
  const [paSuccess, setPaSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPaError('');
    setPaSuccess('');

    if (passwordData.new !== passwordData.confirm) {
      setPaError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 6) {
      setPaError('New password must be at least 6 characters');
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

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-primary text-white py-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <h4 className="mb-0 text-center">My Profile</h4>
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
                    <hr className="my-3 opacity-10" />
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="text-muted small text-uppercase fw-bold">Phone</label>
                        <p className="mb-0">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div className="col-6 mb-3">
                        <label className="text-muted small text-uppercase fw-bold">City</label>
                        <p className="mb-0">{user?.city || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small text-uppercase fw-bold">Office Address</label>
                      <p className="mb-0">{user?.address || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

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
