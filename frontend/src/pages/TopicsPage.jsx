import { useEffect, useState } from 'react'
import ApiService from '../services/api'

export default function TopicsPage() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTopics, setFilteredTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)

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

  const handleView = (topic) => {
    setSelectedTopic(topic)
  }

  const handleCloseModal = () => {
    setSelectedTopic(null)
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading topics...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4 pb-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold text-dark">Constitutional Topics</h4>
              <p className="text-muted mb-0">Browse and learn about various topics of the Indian Constitution</p>
            </div>
          </div>

          {error && <div className="alert alert-danger shadow-sm">{error}</div>}

          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search legal topics, articles, or rights..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
              <p className="text-muted fs-5">
                {searchQuery ? 'No topics found matching your search.' : 'No topics available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                    <div className="card-body p-4 d-flex flex-column">
                      <h6 className="fw-bold text-dark mb-2">{topic.title}</h6>
                      <p className="card-text text-muted small flex-grow-1">
                        {topic.description.length > 120
                          ? `${topic.description.substring(0, 120)}...`
                          : topic.description}
                      </p>
                      <button
                        className="btn btn-sm btn-primary mt-3 align-self-start px-3"
                        onClick={() => handleView(topic)}
                      >
                        <i className="bi bi-eye me-2"></i>View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white p-4">
                <h5 className="modal-title fw-bold">{selectedTopic.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-4">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                    Constitutional Guide
                  </span>
                  <p className="lead text-dark fw-medium mb-4">{selectedTopic.description}</p>
                </div>

                <hr className="my-4 opacity-10" />

                <div className="topic-content" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#444' }}>
                  {selectedTopic.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? <p key={index} className="mb-3">{paragraph}</p> : <br key={index} />
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={handleCloseModal}>Close</button>
                <a href="/ask" className="btn btn-primary px-4">
                  <i className="bi bi-chat-dots me-2"></i>Ask AI Counselor
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}
