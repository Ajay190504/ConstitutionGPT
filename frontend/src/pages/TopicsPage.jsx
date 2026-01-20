import React, { useEffect, useState } from 'react'
import ApiService from '../services/api'

export default function TopicsPage(){
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTopics, setFilteredTopics] = useState([])

  useEffect(() => {
    loadTopics()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchTopics()
    } else {
      setFilteredTopics(topics)
    }
  }, [searchQuery, topics])

  const loadTopics = async () => {
    try {
      const response = await ApiService.getTopics()
      setTopics(response.topics || [])
      setFilteredTopics(response.topics || [])
    } catch (err) {
      setError(err.message || 'Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const searchTopics = async () => {
    try {
      const response = await ApiService.searchTopics(searchQuery)
      setFilteredTopics(response.topics || [])
    } catch (err) {
      setError(err.message || 'Failed to search topics')
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
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
          <h5>Constitutional Topics</h5>
          <p className="text-muted">Browse and learn about various topics of the Indian Constitution</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">
                {searchQuery ? 'No topics found matching your search.' : 'No topics available.'}
              </p>
            </div>
          ) : (
            <div className="row">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">{topic.title}</h6>
                      <p className="card-text text-muted small">{topic.description}</p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // Create a modal or expand to show full content
                          alert(topic.content)
                        }}
                      >
                        Learn More
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
