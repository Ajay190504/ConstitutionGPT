import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

export default function TopicManagementPage() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState({ title: '', description: '', content: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getTopics();
            setTopics(response.topics || []);
        } catch (err) {
            setError('Failed to load topics. Please ensure you have administrative privileges.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (topic = { title: '', description: '', content: '' }, edit = false) => {
        setCurrentTopic(topic);
        setIsEditing(edit);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentTopic({ title: '', description: '', content: '' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                await ApiService.updateTopic(currentTopic.id, currentTopic);
            } else {
                await ApiService.addTopic(currentTopic);
            }
            await fetchTopics();
            handleCloseModal();
        } catch (err) {
            setError('Action failed: ' + (err.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
            try {
                await ApiService.deleteTopic(id);
                fetchTopics();
            } catch (err) {
                alert('Delete failed: ' + (err.message || 'Unknown error'));
            }
        }
    };

    if (loading && topics.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Fetching topics library...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <h2 className="fw-bold text-dark mb-1">Topic Management</h2>
                    <p className="text-muted mb-0">Manage the constitutional repository for all users.</p>
                </div>
                <div className="col-auto">
                    <button className="btn btn-primary d-flex align-items-center px-4 shadow-sm" onClick={() => handleOpenModal()}>
                        <i className="bi bi-plus-lg me-2"></i>Add New Topic
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Legal Topic</th>
                                <th className="py-3">Description Snippet</th>
                                <th className="py-3">Last Updated</th>
                                <th className="text-end pe-4 py-3">Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <p className="text-muted mb-0">No topics found. Start by adding one!</p>
                                    </td>
                                </tr>
                            ) : (
                                topics.map((topic) => (
                                    <tr key={topic.id} className="transition-all">
                                        <td className="ps-4 py-3">
                                            <div className="fw-bold text-dark">{topic.title}</div>
                                            <small className="text-muted">ID: {topic.id.substring(0, 8)}...</small>
                                        </td>
                                        <td className="py-3 text-muted" style={{ maxWidth: '300px' }}>
                                            <p className="mb-0 text-truncate">{topic.description}</p>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-muted small">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {new Date(topic.created_at || Date.now()).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4 py-3">
                                            <div className="btn-group shadow-sm">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Edit Topic"
                                                    onClick={() => handleOpenModal(topic, true)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Topic"
                                                    onClick={() => handleDelete(topic.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered shadow-lg">
                        <div className="modal-content border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark ps-2 pt-2">
                                    {isEditing ? 'Update Legal Topic' : 'Publish New Topic'}
                                </h5>
                                <button type="button" className="btn-close me-2 mt-2" onClick={handleCloseModal} aria-label="Close"></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label htmlFor="topicTitle" className="form-label fw-semibold">Focus Title</label>
                                        <input
                                            id="topicTitle"
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0"
                                            placeholder="e.g., Right to Privacy (Article 21)"
                                            value={currentTopic.title}
                                            onChange={(e) => setCurrentTopic({ ...currentTopic, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="topicDesc" className="form-label fw-semibold">Quick Summary (Description)</label>
                                        <input
                                            id="topicDesc"
                                            type="text"
                                            className="form-control border-0 bg-light"
                                            placeholder="Brief overview shown on the grid cards..."
                                            value={currentTopic.description}
                                            onChange={(e) => setCurrentTopic({ ...currentTopic, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-0">
                                        <label htmlFor="topicContent" className="form-label fw-semibold">Comprehensive Legal Content</label>
                                        <textarea
                                            id="topicContent"
                                            className="form-control border-0 bg-light"
                                            rows="12"
                                            placeholder="Detailed information, references, and redirect links..."
                                            value={currentTopic.content}
                                            onChange={(e) => setCurrentTopic({ ...currentTopic, content: e.target.value })}
                                            required
                                        ></textarea>
                                        <div className="form-text d-flex justify-content-between mt-2">
                                            <span>Supports standard formatting via spacing.</span>
                                            <span className="text-primary italic">Admins can include external reference links here.</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light px-4 text-muted" onClick={handleCloseModal}>Discard</button>
                                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            isEditing ? 'Save Changes' : 'Publish Topic'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .transition-all { transition: all 0.25s ease; }
                .table-hover tbody tr:hover { background-color: rgba(0,0,0,0.01); }
                .form-control:focus {
                    box-shadow: none;
                    background-color: #fff !important;
                    border: 1px solid #dee2e6 !important;
                }
            `}</style>
        </div>
    );
}
