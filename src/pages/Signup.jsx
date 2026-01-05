import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    referral_code: "",
    isUSA: "", // US check
  });

  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    if (form.isUSA !== "yes") {
      alert("Only USA users allowed.");
      return;
    }

    try {
      setLoading(true); // show spinner
      const res = await registerUser(form);

      if (res.error) {
        alert(res.error);
        return;
      }

      alert(res.message || "Account created successfully!");
      nav("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed. Check console for details.");
    } finally {
      setLoading(false); // hide spinner
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="card-title">Sign Up</h2>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Referral Code (optional)"
            value={form.referral_code}
            onChange={(e) =>
              setForm({ ...form, referral_code: e.target.value })
            }
          />

          {/* US Check */}
          <div className="us-check">
            <label>Are you from the United States?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="isUSA"
                  value="yes"
                  checked={form.isUSA === "yes"}
                  onChange={(e) => setForm({ ...form, isUSA: e.target.value })}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="isUSA"
                  value="no"
                  checked={form.isUSA === "no"}
                  onChange={(e) => setForm({ ...form, isUSA: e.target.value })}
                />
                No
              </label>
            </div>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <span className="link" onClick={() => nav("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

