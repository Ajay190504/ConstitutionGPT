import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function ConnectLawyerPage() {
    const [lawyers, setLawyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [ratingFilter, setRatingFilter] = useState(0)
    const [specializationFilter, setSpecializationFilter] = useState('')
    const [sortFilter, setSortFilter] = useState('')
    const [nameFilter, setNameFilter] = useState('')

    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedLawyer, setSelectedLawyer] = useState(null)
    const [bookingData, setBookingData] = useState({ date: '', timeSlot: '10:00 AM', notes: '' })

    const fetchLawyers = async (city = '', minRating = 0, specialization = '', sort = '', name = '') => {
        setLoading(true)
        try {
            const data = await ApiService.getLawyers(city, minRating, specialization, sort, name)
            setLawyers(data.lawyers)
        } catch (err) {
            setError('Failed to load lawyers')
        } finally {
            setLoading(false)
        }
    }

    const handleBooking = async (e) => {
        e.preventDefault()
        try {
            await ApiService.bookAppointment(selectedLawyer.id, bookingData.date, bookingData.timeSlot, bookingData.notes)
            setShowBookingModal(false)
            alert('Appointment request sent successfully!')
        } catch (err) {
            alert('Failed to book appointment: ' + err.message)
        }
    }

    useEffect(() => {
        fetchLawyers()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchLawyers(cityFilter, ratingFilter, specializationFilter, sortFilter, nameFilter)
    }

    const handleSortChange = (newSort) => {
        setSortFilter(newSort)
        fetchLawyers(cityFilter, ratingFilter, specializationFilter, newSort, nameFilter)
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning me-1"></i>);
        }
        if (hasHalfStar) {
            stars.push(<i key="half" className="bi bi-star-half text-warning me-1"></i>);
        }
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="bi bi-star text-muted me-1"></i>);
        }
        return stars;
    };

    return (
        <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h2>Connect with Legal Experts</h2>
                <form className="d-flex flex-wrap gap-2" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        style={{ maxWidth: '180px' }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="City..."
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{ maxWidth: '140px' }}
                    />
                    <select
                        className="form-select"
                        value={specializationFilter}
                        onChange={(e) => setSpecializationFilter(e.target.value)}
                        style={{ maxWidth: '160px' }}
                    >
                        <option value="">All Specializations</option>
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Civil Law">Civil Law</option>
                        <option value="Constitutional Law">Constitutional Law</option>
                        <option value="Family Law">Family Law</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Consumer Rights">Consumer Rights</option>
                    </select>
                    <select
                        className="form-select"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(Number(e.target.value))}
                        style={{ maxWidth: '130px' }}
                    >
                        <option value="0">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                    </select>
                    <select
                        className="form-select"
                        value={sortFilter}
                        onChange={(e) => handleSortChange(e.target.value)}
                        style={{ maxWidth: '160px' }}
                    >
                        <option value="">Sort By: Default</option>
                        <option value="fee_asc">Fee: Low to High</option>
                        <option value="exp_desc">Experience: High to Low</option>
                        <option value="rating_desc">Rating: High to Low</option>
                    </select>
                    <button className="btn btn-primary" type="submit">Search</button>
                    {(cityFilter || ratingFilter > 0 || specializationFilter || sortFilter || nameFilter) && (
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setCityFilter(''); setRatingFilter(0); setSpecializationFilter(''); setSortFilter(''); setNameFilter(''); fetchLawyers('', 0, '', '', ''); }}>Clear</button>
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
                                            <div className="mb-1">
                                                {renderStars(lawyer.avg_rating)}
                                                <small className="text-muted ms-1">({lawyer.review_count || 0})</small>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle">Verified Lawyer</span>
                                        </div>
                                    </div>
                                    <p className="card-text mb-2 text-primary fw-bold">
                                        <i className="bi bi-briefcase me-2"></i>
                                        {lawyer.specialization || 'General Practice'} ({lawyer.years_of_experience || 0} Years Exp)
                                    </p>
                                    <p className="card-text mb-2">
                                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                                        <strong>City:</strong> {lawyer.city}
                                    </p>
                                    <p className="card-text mb-2">
                                        <i className="bi bi-cash-stack me-2 text-success"></i>
                                        <strong>Consultation Fee:</strong> ₹{lawyer.consultation_fee || 0}
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
                                    <button
                                        onClick={() => { setSelectedLawyer(lawyer); setShowBookingModal(true); }}
                                        className="btn btn-sm btn-outline-success flex-grow-1 fw-bold"
                                    >
                                        Book
                                    </button>
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

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Book Consultation with {selectedLawyer?.username}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBookingModal(false)}></button>
                            </div>
                            <form onSubmit={handleBooking}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Select Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Select Time Slot</label>
                                        <select
                                            className="form-select"
                                            value={bookingData.timeSlot}
                                            onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                        >
                                            <option>10:00 AM</option>
                                            <option>11:00 AM</option>
                                            <option>12:00 PM</option>
                                            <option>02:00 PM</option>
                                            <option>03:00 PM</option>
                                            <option>04:00 PM</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Notes for Lawyer</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Briefly describe your legal concern..."
                                            value={bookingData.notes}
                                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Request Consultation</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
