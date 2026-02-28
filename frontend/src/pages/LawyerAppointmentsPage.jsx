import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

const LawyerAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAppointments = async () => {
        try {
            const data = await ApiService.getLawyerAppointments()
            setAppointments(data.appointments)
        } catch (err) {
            setError('Failed to load client appointments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    const updateStatus = async (id, status) => {
        try {
            await ApiService.updateAppointmentStatus(id, status)
            fetchAppointments()
        } catch (err) {
            alert('Failed to update status')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge bg-success">Confirmed</span>
            case 'cancelled': return <span className="badge bg-danger">Cancelled</span>
            case 'completed': return <span className="badge bg-info">Completed</span>
            default: return <span className="badge bg-warning text-dark">Pending</span>
        }
    }

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4">Client Consultations</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Time</th>
                                    <th className="py-3">Notes</th>
                                    <th className="py-3">Status</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((appt) => (
                                    <tr key={appt.id}>
                                        <td className="px-4">
                                            <div className="fw-bold">{appt.user_name}</div>
                                        </td>
                                        <td>{new Date(appt.date).toLocaleDateString()}</td>
                                        <td>{appt.time_slot}</td>
                                        <td style={{ maxWidth: '200px' }} className="text-truncate" title={appt.notes}>
                                            {appt.notes || <span className="text-muted small">No notes</span>}
                                        </td>
                                        <td>{getStatusBadge(appt.status)}</td>
                                        <td className="px-4 text-end">
                                            <div className="btn-group">
                                                {appt.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success" onClick={() => updateStatus(appt.id, 'confirmed')}>Accept</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(appt.id, 'cancelled')}>Reject</button>
                                                    </>
                                                )}
                                                {appt.status === 'confirmed' && (
                                                    <button className="btn btn-sm btn-info" onClick={() => updateStatus(appt.id, 'completed')}>Complete</button>
                                                )}
                                                <Link to={`/chat/${appt.user_id}`} className="btn btn-sm btn-outline-primary">Message</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            No consultation requests found.
                                        </td>
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

export default LawyerAppointmentsPage
