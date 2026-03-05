import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

export default function TopicDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const response = await ApiService.getTopic(id);
                setTopic(response);
            } catch (err) {
                setError(err.message || 'Failed to load topic details');
            } finally {
                setLoading(false);
            }
        };

        fetchTopic();
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading topic...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger shadow-sm d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                </div>
                <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/topics')}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Topics
                </button>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="container mt-5 text-center">
                <h4>Topic not found</h4>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/topics')}>
                    Back to Topics
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a></li>
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/topics'); }}>Topics</a></li>
                    <li className="breadcrumb-item active" aria-current="page">{topic.title}</li>
                </ol>
            </nav>

            <div className="row justify-content-center">
                <div className="col-lg-9">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 p-md-5">
                            <button
                                className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center text-muted"
                                onClick={() => navigate('/topics')}
                            >
                                <i className="bi bi-arrow-left me-2"></i>Back to Browse Topics
                            </button>

                            <h1 className="fw-bold mb-3 text-dark">{topic.title}</h1>

                            <div className="d-flex align-items-center mb-4 text-muted small">
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-3">
                                    Constitutional Law
                                </span>
                                <span><i className="bi bi-book me-1"></i> Topic ID: {topic.id}</span>
                            </div>

                            <hr className="my-4 opacity-10" />

                            <div className="topic-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333' }}>
                                {topic.content.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-3">{paragraph}</p>
                                ))}
                            </div>

                            <div className="mt-5 p-4 bg-light rounded-3 border-start border-4 border-primary">
                                <h5 className="fw-bold mb-2">Need more clarification?</h5>
                                <p className="text-muted mb-3">Our AI legal assistant can help you understand this topic in more detail.</p>
                                <button className="btn btn-primary px-4" onClick={() => navigate('/ask')}>
                                    Ask a Question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
