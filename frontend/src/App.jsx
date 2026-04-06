import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
import TopicDetailsPage from "./pages/TopicDetailsPage";
import TopicManagementPage from "./pages/TopicManagementPage";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await ApiService.getCurrentUser();
        setUser(userData?.user || userData); // Extract 'user' or fallback
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await ApiService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount((data.notifications || []).filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      // Optimistic upate so the count drops immediately
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      try {
        await ApiService.markNotificationRead(notif.id);
      } catch (err) {
        console.error('Failed to mark notification read', err);
        // Fallback: refetch if it failed
        fetchNotifications();
      }
    }
  };

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
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  ) : (
    <div className="app-shell">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <nav className={`sidebar bg-dark text-white p-3 shadow ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand mb-4 px-2 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-primary fw-bold mb-0">ConstitutionGPT</h4>
            <small className="text-white-50">Legal Intelligence</small>
          </div>
          <button
            className="btn btn-sm btn-link text-white d-md-none"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
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
            <Link className="nav-link text-white" to="/topics">
              <i className="bi bi-search me-2"></i>Browse Topics
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

          {user?.role === "admin" && (
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/admin/topics">
                <i className="bi bi-gear-fill me-2"></i>Manage Topics
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
        <div className="header shadow-sm px-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-3 d-md-none"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
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

          {/* Notifications Dropdown */}
          <div className="position-relative ms-auto dropdown">
            <button 
              className="btn btn-light position-relative rounded-circle p-2 d-flex align-items-center justify-content-center border"
              style={{ width: '40px', height: '40px' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="bi bi-bell-fill text-secondary"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="dropdown-menu dropdown-menu-end show shadow-lg border-0 mt-2 p-0" 
                style={{ width: '320px', zIndex: 1050, position: 'absolute', right: 0 }}
              >
                <div className="bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Notifications</h6>
                  {unreadCount > 0 && <span className="badge bg-light text-primary">{unreadCount} New</span>}
                </div>
                <div className="list-group list-group-flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <button 
                      key={notif.id} 
                      className={`list-group-item list-group-item-action p-3 border-bottom ${!notif.is_read ? 'bg-light' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex w-100 justify-content-between mb-1">
                        <small className={!notif.is_read ? 'fw-bold text-dark' : 'text-secondary'}>System Alert</small>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className={`mb-0 small ${!notif.is_read ? 'fw-medium text-dark' : 'text-muted'}`}>
                        {notif.message}
                      </p>
                    </button>
                  )) : (
                    <div className="p-4 text-center text-muted">
                        <i className="bi bi-bell-slash fs-3 mb-2 d-block text-secondary opacity-50"></i>
                        <p className="mb-0 small">You have no notifications right now.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Click outside to close notifications */}
        {showNotifications && (
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            style={{ zIndex: 1040 }} 
            onClick={() => setShowNotifications(false)}
          ></div>
        )}
        
        <div className="content-area p-4 position-relative" style={{ zIndex: 1 }}>
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
            <Route
              path="/admin/topics"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <TopicManagementPage />
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
