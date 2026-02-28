import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AskPage from "./pages/AskPage";
import AnswerPage from "./pages/AnswerPage";
import TopicsPage from "./pages/TopicsPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import HelpPage from "./pages/HelpPage";
import ConnectLawyerPage from "./pages/ConnectLawyerPage";
import AdminPage from "./pages/AdminPage";
import InboxPage from "./pages/InboxPage";
import MessagingPage from "./pages/MessagingPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import LawyerAppointmentsPage from "./pages/LawyerAppointmentsPage";
import ApiService from "./services/api";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await ApiService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    ApiService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  return !user ? (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  ) : (
    <div className="app-shell">
      <nav className="sidebar bg-dark text-white p-3 shadow">
        <div className="brand mb-4 px-2">
          <h4 className="text-primary fw-bold mb-0">ConstitutionGPT</h4>
          <small className="text-white-50">Legal Intelligence</small>
        </div>
        <ul className="nav flex-column gap-1">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/dashboard">
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/ask">
              <i className="bi bi-chat-dots-fill me-2"></i>Ask Question
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/inbox">
              <i className="bi bi-envelope-fill me-2"></i>Inbox
            </Link>
          </li>

          {user?.role === "user" && (
            <li className="nav-item">
              <Link className="nav-link text-white" to="/my-appointments">
                <i className="bi bi-calendar-check-fill me-2"></i>My Appointments
              </Link>
            </li>
          )}

          {user?.role === "lawyer" && (
            <li className="nav-item">
              <Link className="nav-link text-white" to="/lawyer/appointments">
                <i className="bi bi-calendar-event-fill me-2"></i>Client Appointments
              </Link>
            </li>
          )}

          {user?.role === "user" && (
            <li className="nav-item">
              <Link className="nav-link text-white bg-primary bg-opacity-25 mt-2" to="/connect-lawyer">
                <i className="bi bi-people-fill me-2"></i>Connect to Lawyer
              </Link>
            </li>
          )}

          {user?.role === "admin" && (
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/admin">
                <i className="bi bi-shield-lock-fill me-2"></i>Admin Dashboard
              </Link>
            </li>
          )}

          <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <li className="nav-item">
            <Link className="nav-link text-white" to="/history">
              <i className="bi bi-clock-history me-2"></i>Chat History
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/profile">
              <i className="bi bi-person-fill me-2"></i>My Profile
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/help">
              <i className="bi bi-question-circle-fill me-2"></i>Help & Support
            </Link>
          </li>
        </ul>
        <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <div className="user-section p-2 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
          <div className="d-flex align-items-center mb-2">
            <div
              className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <small className="text-white d-block text-truncate fw-bold">{user?.username}</small>
              <small className="text-white-50 d-block text-truncate" style={{ fontSize: "0.7rem" }}>
                {user?.role}
              </small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-light w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main">
        <div className="header shadow-sm px-4">
          <h5 className="mb-0">
            {window.location.pathname.includes("/connect-lawyer")
              ? "Legal Marketplace"
              : window.location.pathname.includes("/admin")
                ? "Administration"
                : window.location.pathname.includes("/chat")
                  ? "Messaging"
                  : window.location.pathname.includes("/inbox")
                    ? "Inbox"
                    : `Welcome back, ${user?.username}`}
          </h5>
        </div>
        <div className="content-area p-4">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/answer/:id" element={<AnswerPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/connect-lawyer" element={<ConnectLawyerPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin", "moderator"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/chat/:otherId" element={<MessagingPage />} />

            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute user={user} allowedRoles={["user", "admin"]}>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lawyer/appointments"
              element={
                <ProtectedRoute user={user} allowedRoles={["lawyer", "admin"]}>
                  <LawyerAppointmentsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
