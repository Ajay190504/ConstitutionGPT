import React from "react";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

export default function HistoryPage(){
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await ApiService.getHistory()
      setHistory(response.history || [])
    } catch (err) {
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return
    }

    try {
      await ApiService.deleteChat(chatId)
      loadHistory() // Reload history after deletion
    } catch (err) {
      setError(err.message || 'Failed to delete chat')
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Chat History</h5>
            <Link to="/ask" className="btn btn-primary">Ask New Question</Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {history.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No chat history yet.</p>
              <p>Start by asking your first question about the Indian Constitution!</p>
              <Link to="/ask" className="btn btn-primary">Ask a Question</Link>
            </div>
          ) : (
            <div className="list-group">
              {history.map((chat) => (
                <div key={chat.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{chat.message}</h6>
                      <p className="mb-1 text-muted">
                        {chat.response.substring(0, 100)}...
                      </p>
                      <small className="text-muted">{formatDate(chat.timestamp)}</small>
                    </div>
                    <div className="btn-group">
                      <Link 
                        to={`/answer/${chat.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(chat.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
