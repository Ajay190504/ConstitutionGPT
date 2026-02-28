import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApiService from "../services/api";

function AnswerPage() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChat();
  }, [id]);

  const loadChat = async () => {
    try {
      const response = await ApiService.getChat(id);
      setChat(response);
    } catch (err) {
      setError(err.message || "Chat not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          {error || "Chat not found"}
        </div>
        <Link to="/history" className="btn btn-primary">
          Back to History
        </Link>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Chat Details</h3>
        <div>
          <Link to="/history" className="btn btn-outline-secondary me-2">
            Back to History
          </Link>
          <Link to="/ask" className="btn btn-primary">
            Ask New Question
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <small className="text-muted">{formatDate(chat.timestamp)}</small>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h5>Your Question:</h5>
            <div className="alert alert-light">
              <p className="mb-0">{chat.message}</p>
            </div>
          </div>

          <div>
            <h5>ConstitutionGPT Answer:</h5>
            <div className="alert alert-info">
              <div 
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ 
                  __html: chat.response.replace(/\n/g, '<br />') 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="card">
          <div className="card-body">
            <h6>Actions:</h6>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigator.clipboard.writeText(chat.response)}
              >
                Copy Answer
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerPage;
