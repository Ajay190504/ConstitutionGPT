import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function ConnectLawyerPage() {
    const [lawyers, setLawyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cityFilter, setCityFilter] = useState('')

    const fetchLawyers = async (city = '') => {
        setLoading(true)
        try {
            const data = await ApiService.getLawyers(city)
            setLawyers(data.lawyers)
        } catch (err) {
            setError('Failed to load lawyers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLawyers()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchLawyers(cityFilter)
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Connect with Legal Experts</h2>
                <form className="d-flex gap-2" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by city..."
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{ maxWidth: '200px' }}
                    />
                    <button className="btn btn-primary" type="submit">Search</button>
                    {cityFilter && (
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setCityFilter(''); fetchLawyers(''); }}>Clear</button>
                    )}
                </form>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {lawyers.length > 0 ? lawyers.map(lawyer => (
                        <div className="col-md-6 col-lg-4" key={lawyer.id}>
                            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                            {lawyer.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className="mb-0">{lawyer.username}</h5>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle">Verified Lawyer</span>
                                        </div>
                                    </div>
                                    <p className="card-text mb-2">
                                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                                        <strong>City:</strong> {lawyer.city}
                                    </p>
                                    <p className="card-text mb-2">
                                        <i className="bi bi-telephone me-2 text-primary"></i>
                                        <strong>Phone:</strong> {lawyer.phone}
                                    </p>
                                    <p className="card-text mb-3">
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        <strong>Email:</strong> {lawyer.email}
                                    </p>
                                    {lawyer.address && (
                                        <p className="card-text small text-muted">
                                            <strong>Office:</strong> {lawyer.address}
                                        </p>
                                    )}
                                </div>
                                <div className="card-footer bg-transparent border-0 pb-3 d-flex gap-2">
                                    <a href={`tel:${lawyer.phone}`} className="btn btn-sm btn-outline-primary flex-grow-1 fw-bold">Call</a>
                                    <Link to={`/chat/${lawyer.id}`} className="btn btn-sm btn-primary flex-grow-1 fw-bold">Message</Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3 fs-5">No verified lawyers found in this city yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
