import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SurveyComplete from "./pages/SurveyComplete.jsx";
import Withdraw from "./pages/Withdraw.jsx";
import GeoWarning from "./pages/GeoWarning.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.is_admin !== 1) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/survey-complete" element={<SurveyComplete />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/geo-warning" element={<GeoWarning />} />

        {/* Admin protected route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

