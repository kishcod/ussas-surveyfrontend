import React from "react";
import SurveysAdmin from "./SurveysAdmin";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.is_admin !== 1) {
    return (
      <h2 className="text-center mt-10 text-red-600 font-semibold">
        Access denied. Admins only.
      </h2>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
      <SurveysAdmin />
    </div>
  );
}
