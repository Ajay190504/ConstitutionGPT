import React, { useState, useEffect } from 'react'
import ApiService from '../services/api'

export default function AdminPage() {
    const [lawyers, setLawyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState(null)

    const fetchAllLawyers = async () => {
        setLoading(true)
        try {
            const data = await ApiService.adminGetLawyers()
            setLawyers(data.lawyers)
        } catch (err) {
            setError('Failed to load lawyers for verification')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllLawyers()
    }, [])

    const handleToggleVerify = async (lawyerId, currentStatus) => {
        setActionLoading(lawyerId)
        try {
            await ApiService.verifyLawyer(lawyerId, !currentStatus)
            setLawyers(lawyers.map(l => l.id === lawyerId ? { ...l, is_verified: !currentStatus } : l))
        } catch (err) {
            alert('Failed to update verification status')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) return <div className="p-5 text-center"><div className="spinner-border"></div></div>

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-white py-3 border-0">
                    <h3 className="mb-0">Admin: Lawyer Verification</h3>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Contact Info</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lawyers.length > 0 ? lawyers.map(lawyer => (
                                    <tr key={lawyer.id}>
                                        <td>
                                            <div className="fw-bold">{lawyer.username}</div>
                                            <small className="text-muted">{lawyer.email}</small>
                                        </td>
                                        <td>
                                            <div>{lawyer.phone}</div>
                                        </td>
                                        <td>
                                            <div>{lawyer.city}</div>
                                            <small className="text-muted d-block" style={{ maxWidth: '200px' }}>{lawyer.address}</small>
                                        </td>
                                        <td>
                                            {lawyer.is_verified ? (
                                                <span className="badge bg-success">Verified</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark">Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${lawyer.is_verified ? 'btn-outline-danger' : 'btn-success'}`}
                                                onClick={() => handleToggleVerify(lawyer.id, lawyer.is_verified)}
                                                disabled={actionLoading === lawyer.id}
                                            >
                                                {actionLoading === lawyer.id ? '...' : (lawyer.is_verified ? 'Revoke' : 'Verify')}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">No lawyers registered yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
