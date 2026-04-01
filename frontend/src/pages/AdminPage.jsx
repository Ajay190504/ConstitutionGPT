import  { useState, useEffect } from 'react'
import ApiService from '../services/api'

export default function AdminPage() {
    const [lawyers, setLawyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState(null)

    const [activeTab, setActiveTab] = useState('lawyers')
    const [queries, setQueries] = useState([])
    const [queriesLoading, setQueriesLoading] = useState(false)
    const [queriesError, setQueriesError] = useState('')

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

    const fetchAllQueries = async () => {
        setQueriesLoading(true)
        try {
            const data = await ApiService.adminGetQueries()
            setQueries(data.queries)
        } catch (err) {
            setQueriesError('Failed to load user queries')
        } finally {
            setQueriesLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'lawyers') {
            fetchAllLawyers()
        } else if (activeTab === 'queries') {
            fetchAllQueries()
        }
    }, [activeTab])

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

    const handleResolveQuery = async (queryId, newStatus) => {
        setActionLoading(queryId)
        try {
            await ApiService.adminUpdateQueryStatus(queryId, newStatus)
            setQueries(queries.map(q => q.id === queryId ? { ...q, status: newStatus } : q))
        } catch (err) {
            alert('Failed to update query status')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading && activeTab === 'lawyers') return <div className="p-5 text-center"><div className="spinner-border"></div></div>
    if (queriesLoading && activeTab === 'queries') return <div className="p-5 text-center"><div className="spinner-border"></div></div>

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Admin Dashboard</h3>
                <div className="btn-group shadow-sm">
                    <button 
                        className={`btn ${activeTab === 'lawyers' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('lawyers')}
                    >
                        Lawyer Verification
                    </button>
                    <button 
                        className={`btn ${activeTab === 'queries' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('queries')}
                    >
                        User Requests
                    </button>
                </div>
            </div>

            {activeTab === 'lawyers' && (
                <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="mb-0 text-muted">Lawyer Registration Approvals</h5>
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
                                    <th>ID Proof / License</th>
                                    <th>Attachment</th>
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
                                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '150px' }}>{lawyer.address}</small>
                                        </td>
                                        <td>
                                            <code className="bg-light p-1 rounded border small">{lawyer.lawyer_id_proof || 'N/A'}</code>
                                        </td>
                                        <td>
                                            {lawyer.lawyer_proof_file ? (
                                                <a
                                                    href={`${ApiService.baseURL}/uploads/${lawyer.lawyer_proof_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-link p-0"
                                                >
                                                    <i className="bi bi-file-earmark-text me-1"></i>View Doc
                                                </a>
                                            ) : (
                                                <span className="text-muted small">No file</span>
                                            )}
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
            )}

            {activeTab === 'queries' && (
                <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="mb-0 text-muted">User Requests and Queries</h5>
                    </div>
                    <div className="card-body">
                        {queriesError && <div className="alert alert-danger">{queriesError}</div>}
                        
                        <div className="row g-4">
                            {queries.length > 0 ? queries.map(query => (
                                <div className="col-md-6 col-lg-4" key={query.id}>
                                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `5px solid ${query.status === 'resolved' ? '#198754' : query.status === 'dismissed' ? '#dc3545' : '#ffc107'}`, borderRadius: '10px' }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className={`badge ${query.status === 'resolved' ? 'bg-success' : query.status === 'dismissed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                    {query.status.toUpperCase()}
                                                </span>
                                                <small className="text-muted">{new Date(query.created_at).toLocaleDateString()}</small>
                                            </div>
                                            <h5 className="card-title fw-bold mb-1">{query.subject}</h5>
                                            <p className="small text-primary mb-3">From: {query.username} ({query.email})</p>
                                            
                                            <div className="bg-light p-3 rounded mb-3" style={{ minHeight: '80px' }}>
                                                <p className="card-text small mb-0">{query.message}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="card-footer bg-white border-0 p-4 pt-0 d-flex gap-2">
                                            {query.status === 'pending' ? (
                                                <>
                                                    <button 
                                                        className="btn btn-sm btn-success flex-grow-1 fw-bold"
                                                        onClick={() => handleResolveQuery(query.id, 'resolved')}
                                                        disabled={actionLoading === query.id}
                                                    >
                                                        {actionLoading === query.id ? '...' : <><i className="bi bi-check-circle me-1"></i> Resolve</>}
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger flex-grow-1 fw-bold"
                                                        onClick={() => handleResolveQuery(query.id, 'dismissed')}
                                                        disabled={actionLoading === query.id}
                                                    >
                                                        {actionLoading === query.id ? '...' : <><i className="bi bi-x-circle me-1"></i> Dismiss</>}
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary w-100 fw-bold"
                                                    disabled
                                                >
                                                    Record {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 py-5 text-center text-muted">
                                    <i className="bi bi-inbox display-4 mb-3 d-block"></i>
                                    <h5>No user queries found.</h5>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
