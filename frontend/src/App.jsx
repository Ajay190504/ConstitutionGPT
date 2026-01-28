import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HelpPage from "./pages/HelpPage";
import TopicsPage from "./pages/TopicsPage";
import AskPage from "./pages/AskPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/topics" element={<TopicsPage />} />
      <Route path="/ask" element={<AskPage />} />
    </Routes>
  );
}
