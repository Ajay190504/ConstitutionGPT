import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAppointments = async () => {
        try {
            const data = await ApiService.getUserAppointments()
            setAppointments(data.appointments)
        } catch (err) {
            setError('Failed to load your appointments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return
        try {
            await ApiService.updateAppointmentStatus(id, 'cancelled')
            fetchAppointments()
        } catch (err) {
            alert('Failed to cancel appointment')
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">My Consultations</h2>
                <Link to="/connect-lawyer" className="btn btn-primary">Book New</Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3">Lawyer</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Time</th>
                                    <th className="py-3">Status</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((appt) => (
                                    <tr key={appt.id}>
                                        <td className="px-4">
                                            <div className="fw-bold">{appt.lawyer_name}</div>
                                        </td>
                                        <td>{new Date(appt.date).toLocaleDateString()}</td>
                                        <td>{appt.time_slot}</td>
                                        <td>{getStatusBadge(appt.status)}</td>
                                        <td className="px-4 text-end">
                                            {appt.status === 'pending' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancel(appt.id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <Link to={`/chat/${appt.lawyer_id}`} className="btn btn-sm btn-outline-primary ms-2">Message</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No appointments found. <Link to="/connect-lawyer">Find a lawyer</Link>
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

export default MyAppointmentsPage
