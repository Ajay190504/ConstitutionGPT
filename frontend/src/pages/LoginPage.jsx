import { useState } from "react";
import ApiService from "../services/api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await ApiService.login(username, password);
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setForgotMessage("");
    setLoading(true);

    try {
      const data = await ApiService.forgotPassword(forgotEmail);
      if (data.success) {
        setForgotMessage(data.message);
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: 420, width: '100%' }}>
        <h3 className="mb-3 text-center">
          {isForgotPassword ? "Reset Password" : "Login to ConstitutionGPT"}
        </h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {forgotMessage && <div className="alert alert-success">{forgotMessage}</div>}
        
        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="needs-validation">
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">Username / Email</label>
              <input
                id="loginUsername"
                type="text"
                className="form-control"
                placeholder="Enter Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                id="loginPassword"
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </div>
            
            <div className="text-center mb-3">
              <a 
                href="#" 
                className="text-decoration-none small text-primary"
                onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(""); setForgotMessage(""); }}
              >
                Forgot your password?
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="needs-validation">
            <p className="small text-muted text-center mb-3">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <div className="mb-3">
              <label htmlFor="forgotEmail" className="form-label">Email</label>
              <input
                id="forgotEmail"
                type="email"
                className="form-control"
                placeholder="Enter Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </button>
            </div>
            
            <div className="text-center">
              <a 
                href="#" 
                className="text-decoration-none small"
                onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(""); setForgotMessage(""); }}
              >
                Back to Login
              </a>
            </div>
          </form>
        )}
        
        <hr />
        <div className="text-center">
          <small className="text-muted">Don't have an account?</small><br />
          <a href="/register" className="text-decoration-none fw-bold">Create an account</a>
        </div>
      </div>
    </div>
  );
}
