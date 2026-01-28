import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HelpPage from "./pages/HelpPage";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage onLogin={setUser} />
            )
          }
        />

        {/* DASHBOARD (protected) */}
        <Route
          path="/dashboard"
          element={
            user ? <DashboardPage /> : <Navigate to="/login" />
          }
        />

        {/* HELP */}
        <Route path="/help" element={<HelpPage />} />

        {/* DEFAULT */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
