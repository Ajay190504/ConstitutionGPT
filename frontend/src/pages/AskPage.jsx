import React from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";

function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await ApiService.sendMessage(question);
      
      // Navigate to answer page with the response
      // The backend saves the chat automatically, so we don't need localStorage
      navigate("/history");
    } catch (err) {
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAsk();
    }
  };

  return (
    <div className="container mt-4">
      <h3>Ask ConstitutionGPT</h3>
      <p className="text-muted">Ask any question about the Indian Constitution</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <textarea
            className="form-control"
            rows="6"
            placeholder="e.g., What are the Fundamental Rights guaranteed by the Indian Constitution?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          
          <div className="mt-3">
            <small className="text-muted">Tip: Press Ctrl+Enter to submit</small>
          </div>

          <button
            className="btn btn-primary mt-3"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Thinking...
              </>
            ) : (
              "Ask Question"
            )}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h5>Example Questions:</h5>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <p className="mb-0">What is the structure of the Indian Parliament?</p>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => setQuestion("What is the structure of the Indian Parliament?")}
                >
                  Use this question
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <p className="mb-0">Explain the Fundamental Duties of citizens</p>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => setQuestion("Explain the Fundamental Duties of citizens")}
                >
                  Use this question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskPage;
