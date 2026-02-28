import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function DashboardPage() {
  const [history, setHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    setUser(savedUser)

    const fetchData = async () => {
      try {
        const histRes = await ApiService.getHistory()
        setHistory(histRes.history?.slice(0, 3) || [])

        if (savedUser?.role === 'lawyer') {
          const apptRes = await ApiService.getLawyerAppointments()
          setAppointments(apptRes.appointments?.slice(0, 3) || [])
        } else {
          const apptRes = await ApiService.getUserAppointments()
          setAppointments(apptRes.appointments?.slice(0, 3) || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3"><i className="bi bi-clock-history me-2 text-primary"></i>Recent Activity</h5>

              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="list-group list-group-flush">
                  {history.map(chat => (
                    <Link key={chat.id} to={`/answer/${chat.id}`} className="list-group-item list-group-item-action px-0 border-light d-flex justify-content-between align-items-center">
                      <div className="text-truncate" style={{ maxWidth: '80%' }}>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{new Date(chat.timestamp).toLocaleDateString()}</small>
                        <span className="fw-semibold">{chat.message}</span>
                      </div>
                      <i className="bi bi-chevron-right text-muted small"></i>
                    </Link>
                  ))}
                  <Link to="/history" className="text-center mt-3 d-block small text-decoration-none">View All History</Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="card-text text-muted mb-3">No activity yet — try asking your first question.</p>
                  <Link to="/ask" className="btn btn-sm btn-outline-primary">Start a Chat</Link>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-3 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">
                <i className={`bi ${user?.role === 'lawyer' ? 'bi-calendar-event' : 'bi-calendar-check'} me-2 text-success`}></i>
                {user?.role === 'lawyer' ? 'Pending Requests' : 'Upcoming Consultations'}
              </h5>

              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {appointments.map(appt => (
                    <div key={appt.id} className="list-group-item px-0 border-light d-flex justify-content-between align-items-center">
                      <div>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(appt.date).toLocaleDateString()} at {appt.time_slot}
                        </small>
                        <span className="fw-semibold">
                          {user?.role === 'lawyer' ? `Request from ${appt.user_name}` : `Consultation with ${appt.lawyer_name}`}
                        </span>
                        <div className="mt-1">
                          <span className={`badge bg-${appt.status === 'confirmed' ? 'success' : appt.status === 'pending' ? 'warning text-dark' : 'secondary'} small`} style={{ fontSize: '0.6rem' }}>
                            {appt.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <Link to={user?.role === 'lawyer' ? "/lawyer/appointments" : "/my-appointments"} className="btn btn-sm btn-link text-decoration-none p-0">
                        View
                      </Link>
                    </div>
                  ))}
                  <Link to={user?.role === 'lawyer' ? "/lawyer/appointments" : "/my-appointments"} className="text-center mt-3 d-block small text-decoration-none">
                    Manage All Appointments
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="card-text text-muted mb-0">No upcoming appointments.</p>
                  {user?.role === 'user' && (
                    <Link to="/connect-lawyer" className="btn btn-sm btn-link text-decoration-none mt-2">Book a Lawyer</Link>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Quick Actions</h5>
              <div className="d-flex gap-2">
                <Link to="/ask" className="btn btn-primary d-flex align-items-center">
                  <i className="bi bi-plus-circle me-2"></i>Ask a question
                </Link>
                <Link to="/topics" className="btn btn-outline-secondary d-flex align-items-center">
                  <i className="bi bi-search me-2"></i>Browse topics
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3 shadow-sm border-0 bg-primary text-white">
            <div className="card-body">
              <h6 className="fw-bold mb-3"><i className="bi bi-info-circle me-2"></i>Status</h6>
              <div className="d-flex align-items-center p-2 rounded bg-white bg-opacity-25 mb-2">
                <div className="bg-success rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                <small>AI Server Online</small>
              </div>
              <div className="d-flex align-items-center p-2 rounded bg-white bg-opacity-25">
                <div className="bg-success rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                <small>Database Connected</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
