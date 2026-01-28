import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function MessagingPage() {
    const { otherId } = useParams()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchMessages = async () => {
        try {
            const data = await ApiService.getMessages(otherId)
            setMessages(data.messages)
        } catch (err) {
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [otherId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            await ApiService.sendMessageToOther(otherId, newMessage)
            setNewMessage('')
            fetchMessages()
        } catch (err) {
            alert('Failed to send message')
        }
    }

    if (loading && messages.length === 0) return <div className="p-5 text-center"><div className="spinner-border"></div></div>

    return (
        <div className="container-fluid py-3 h-100 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 border-0 border-bottom d-flex align-items-center">
                    <Link to="/inbox" className="btn btn-sm btn-outline-secondary me-3 rounded-circle">
                        <i className="bi bi-arrow-left"></i>
                    </Link>
                    <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person"></i>
                        </div>
                        <h5 className="mb-0">Legal Consultation Chat</h5>
                    </div>
                </div>

                <div className="card-body flex-grow-1 overflow-auto p-4 bg-light" style={{ display: 'flex', flexDirection: 'column' }}>
                    {messages.length > 0 ? messages.map((msg, index) => {
                        const isMe = msg.sender_id !== otherId;
                        return (
                            <div
                                key={msg.id || index}
                                className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                            >
                                <div
                                    className={`p-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                    style={{
                                        maxWidth: '75%',
                                        borderRadius: isMe ? '15px 15px 0 15px' : '0 15px 15px 15px'
                                    }}
                                >
                                    <p className="mb-1">{msg.message}</p>
                                    <div className="text-end" style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-muted my-auto">
                            <i className="bi bi-chat-dots fs-1 d-block mb-3"></i>
                            <p>Start your legal consultation by sending a message.</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="card-footer bg-white p-3 border-0 border-top">
                    <form onSubmit={handleSendMessage} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control border-0 shadow-none py-2"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ backgroundColor: '#f0f2f5', borderRadius: '20px' }}
                        />
                        <button className="btn btn-primary rounded-circle" type="submit" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
