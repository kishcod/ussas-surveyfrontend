import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram } from "react-icons/fa";
import "../styles.css";

export default function Home() {
  const nav = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="landing-container">
      {/* Top nav */}
      <nav className="landing-nav">
        <div className="nav-left">
          <span className="nav-link" onClick={() => setShowAbout(true)}>About Us</span>
          <span className="nav-link" onClick={() => setShowContact(true)}>Contact Us</span>
        </div>
        <div className="nav-right">
          <button className="landing-btn login" onClick={() => nav("/login")}>Login</button>
          <button className="landing-btn signup" onClick={() => nav("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* Center card (remove buttons inside card!) */}
      <div className="landing-overlay">
        <div className="landing-card">
          <h1 className="landing-title">US-SAAS Survey</h1>
          <p className="landing-subtitle">Earn money online by completing simple surveys daily</p>

          {/* How it works section */}
          <div className="how-section">
            <h3 className="how-title">How it works</h3>
            <div className="how-steps">
              <div className="how-step">
                <span className="step-number">1</span>
                <p>Create an account</p>
              </div>
              <div className="how-step">
                <span className="step-number">2</span>
                <p>Choose surveys</p>
              </div>
              <div className="how-step">
                <span className="step-number">3</span>
                <p>Complete & earn instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer icons */}
      <footer className="landing-footer">
        <FaFacebookF className="social-icon" />
        <FaLinkedinIn className="social-icon" />
        <FaTwitter className="social-icon" />
        <FaInstagram className="social-icon" />
      </footer>

      {/* About modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>About Us</h2>
            <p>
              HF Foundation is a research institution founded by Milly Granham to conduct
              paid research on people living in the US and its states.
            </p>
            <button className="modal-close" onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Contact modal */}
      {showContact && (
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>Contact Us</h2>
            <p>Email: info@ussaas.com</p>
            <button className="modal-close" onClick={() => setShowContact(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
