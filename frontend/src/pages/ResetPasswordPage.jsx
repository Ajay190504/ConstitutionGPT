import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ApiService from "../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await ApiService.resetPassword(token, password);
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password");
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
        <h3 className="mb-3 text-center">Set New Password</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {success ? (
          <div className="text-center">
            <div className="alert alert-success">Your password has been reset successfully!</div>
            <a href="/login" className="btn btn-primary mt-3">Go to Login</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="needs-validation">
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                required
              />
            </div>
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-primary" type="submit" disabled={loading || !token}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
