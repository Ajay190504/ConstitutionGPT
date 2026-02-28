import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function InboxPage() {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchInbox = async () => {
            try {
                const data = await ApiService.getChatInbox()
                setConversations(data.conversations)
            } catch (err) {
                setError('Failed to load inbox')
            } finally {
                setLoading(false)
            }
        }
        fetchInbox()
    }, [])

    if (loading) return <div className="p-5 text-center"><div className="spinner-border"></div></div>

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-white py-3 border-0">
                    <h3 className="mb-0">My Conversations</h3>
                </div>
                <div className="card-body p-0">
                    {error && <div className="alert alert-danger m-3">{error}</div>}

                    <div className="list-group list-group-flush">
                        {conversations.length > 0 ? conversations.map(conv => (
                            <Link
                                key={conv.other_user_id}
                                to={`/chat/${conv.other_user_id}`}
                                className="list-group-item list-group-item-action p-3 border-0 border-bottom d-flex align-items-center"
                            >
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                                    {conv.other_username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="mb-0 text-truncate">{conv.other_username}</h6>
                                        <small className="text-muted">{new Date(conv.timestamp).toLocaleDateString()}</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0 text-muted text-truncate small pe-3">{conv.last_message}</p>
                                        {conv.unread_count > 0 && (
                                            <span className="badge rounded-pill bg-primary">{conv.unread_count}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-chat-dots" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">No conversations yet.</p>
                                <Link to="/connect-lawyer" className="btn btn-primary btn-sm">Connect with a Lawyer</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
