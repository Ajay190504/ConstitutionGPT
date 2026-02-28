import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import useSpeechToText from "../hooks/useSpeechToText";

function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setQuestion(prev => prev + (prev ? " " : "") + transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (speechError) {
      setError("Speech Recognition Error: " + speechError);
    }
  }, [speechError]);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await ApiService.sendMessage(question, lang);

      if (response && response.chat_id) {
        navigate(`/answer/${response.chat_id}`);
      } else {
        navigate("/history");
      }
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
            className={`form-control ${error && !question.trim() ? 'is-invalid' : ''}`}
            rows="6"
            placeholder="Type your question about the Constitution here... (e.g., What are the Fundamental Rights?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <div className="invalid-feedback">Please enter a question to proceed</div>

          <div className="mt-3 d-flex justify-content-between align-items-center">
            <small className="text-muted">Tip: Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit</small>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
              <button
                type="button"
                className={`btn ${lang === 'hi' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setLang('hi')}
              >
                हिन्दी (Hindi)
              </button>
            </div>
            <small className="text-muted">{question.length} characters</small>
            <button
              type="button"
              className={`btn ${isListening ? 'btn-danger pulse' : 'btn-outline-secondary'} ms-2`}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <i className={`bi bi-mic${isListening ? '-fill' : ''}`}></i>
            </button>
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
