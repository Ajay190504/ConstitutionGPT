import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ApiService from '../services/api'
import useSpeechToText from '../hooks/useSpeechToText'

export default function MessagingPage() {
    const { otherId } = useParams()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText()

    useEffect(() => {
        if (transcript) {
            setNewMessage(prev => prev + (prev ? ' ' : '') + transcript)
        }
    }, [transcript])

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
        if (!newMessage.trim() && !selectedFile) return

        try {
            await ApiService.sendMessageToOther(otherId, newMessage, selectedFile)
            setNewMessage('')
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            fetchMessages()
        } catch (err) {
            alert('Failed to send message')
        }
    }

    const [showRatingModal, setShowRatingModal] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')

    const handleRateLawyer = async (e) => {
        e.preventDefault()
        try {
            await ApiService.submitReview(otherId, rating, comment)
            setShowRatingModal(false)
            alert('Rating submitted! Thank you.')
        } catch (err) {
            alert('Failed to submit rating: ' + err.message)
        }
    }

    if (loading && messages.length === 0) return <div className="p-5 text-center"><div className="spinner-border"></div></div>

    return (
        <div className="container-fluid py-3 h-100 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-white py-3 border-0 border-bottom d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <Link to="/inbox" className="btn btn-sm btn-outline-secondary me-3 rounded-circle">
                            <i className="bi bi-arrow-left"></i>
                        </Link>
                        <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-chat-dots"></i>
                            </div>
                            <h5 className="mb-0">Legal Consultation</h5>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-warning fw-bold text-dark rounded-pill px-3" onClick={() => setShowRatingModal(true)}>
                        <i className="bi bi-star-fill me-1"></i> Rate Lawyer
                    </button>
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
                                    {msg.file_url && (
                                        <div className={`mb-2 p-2 rounded ${isMe ? 'bg-white bg-opacity-25' : 'bg-light'}`}>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark-text fs-4 me-2"></i>
                                                <div className="overflow-hidden">
                                                    <div className="text-truncate fw-bold small">{msg.file_name}</div>
                                                    <a
                                                        href={`${ApiService.baseURL.replace('/api', '')}${msg.file_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`small ${isMe ? 'text-white' : 'text-primary'} text-decoration-none`}
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {msg.message && <p className="mb-1">{msg.message}</p>}
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
                    {selectedFile && (
                        <div className="alert alert-info py-1 px-2 mb-2 d-flex justify-content-between align-items-center small">
                            <span className="text-truncate">Attached: {selectedFile.name}</span>
                            <button className="btn btn-sm text-danger p-0" onClick={() => setSelectedFile(null)}>
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="d-flex gap-2 align-items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="d-none"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-circle"
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <i className="bi bi-paperclip"></i>
                        </button>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none py-2"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ backgroundColor: '#f0f2f5', borderRadius: '20px' }}
                        />
                        <button
                            type="button"
                            className={`btn ${isListening ? 'btn-danger pulse' : 'btn-outline-secondary'} rounded-circle`}
                            style={{ width: '40px', height: '40px' }}
                            onClick={isListening ? stopListening : startListening}
                        >
                            <i className={`bi bi-mic${isListening ? '-fill' : ''}`}></i>
                        </button>
                        <button className="btn btn-primary rounded-circle" type="submit" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Rate your Consultation</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRatingModal(false)}></button>
                            </div>
                            <form onSubmit={handleRateLawyer}>
                                <div className="modal-body text-center">
                                    <div className="mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <i
                                                key={star}
                                                className={`bi bi-star${rating >= star ? '-fill' : ''} fs-2 mx-1 text-warning`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setRating(star)}
                                            ></i>
                                        ))}
                                    </div>
                                    <div className="mb-3">
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Write a brief comment about your experience..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowRatingModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Submit Rating</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
