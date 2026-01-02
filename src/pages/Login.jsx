import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState(""); // backend expects email
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      // send email & password (backend expects email)
      const res = await loginUser({ email, password });

      if (!res.token) {
        alert(res.message || "Login failed");
        return;
      }

      // Save JWT token locally
      localStorage.setItem("token", res.token);

      // Save user info locally
      localStorage.setItem("user", JSON.stringify(res.user));

      // Redirect based on admin flag
      if (res.user.is_admin) {
        nav("/admin"); // Admin dashboard
      } else {
        nav("/dashboard"); // Regular user dashboard
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>

        <input
          className="login-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

        <p className="login-footer">
          Don't have an account?{" "}
          <span onClick={() => nav("/signup")} className="login-link">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
