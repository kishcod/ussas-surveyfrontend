import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram
} from "react-icons/fa";
import "../styles.css";

export default function Home() {
  const nav = useNavigate();

  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="landing-container">
      {/* Top nav */}
      <nav className="landing-nav">
        <div className="nav-left">
          <span className="nav-link" onClick={() => setShowAbout(true)}>About</span>
          <span className="nav-link" onClick={() => setShowContact(true)}>Contact</span>
        </div>
        <div className="nav-right">
          <button className="landing-btn login" onClick={() => nav("/login")}>Login</button>
          <button className="landing-btn signup" onClick={() => nav("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* Overlay */}
      <div className="landing-overlay">
        <div className="landing-card">
          <h1 className="landing-title">US-SAAS Survey</h1>

          <p className="landing-subtitle">
            Earn rewards by completing short surveys. Free to join.
          </p>

          <button className="cta-primary" onClick={() => nav("/signup")}>
            Start Earning Free
          </button>

          <p className="cta-note">
            Available to U.S. residents 18+ • No guaranteed income
          </p>

          {/* How it works */}
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
                <p>Complete & earn rewards</p>
              </div>
            </div>
          </div>
        </div>

     <footer className="landing-footer">
  <div className="footer-icons">
    <FaFacebookF className="social-icon" />
    <FaLinkedinIn className="social-icon" />
    <FaTwitter className="social-icon" />
    <FaInstagram className="social-icon" />
  </div>

  <div className="footer-links">
    <span onClick={() => setShowPrivacy(true)}>Privacy Policy</span>
    <span className="footer-sep">•</span>
    <span onClick={() => setShowTerms(true)}>Terms</span>
  </div>

  <div className="footer-divider"></div>

  <p className="footer-copy">
    © {new Date().getFullYear()} US-SAAS Survey. All rights reserved.
  </p>
</footer>
 </div>

      {/* ABOUT */}
      {showAbout && (
        <Modal onClose={() => setShowAbout(false)} title="About Us">
          <p>
            US-SAAS Survey connects U.S. residents with legitimate market research
            opportunities. Participation is free and voluntary.
          </p>
        </Modal>
      )}

      {/* CONTACT */}
      {showContact && (
        <Modal onClose={() => setShowContact(false)} title="Contact Us">
          <p>Email: support@ussassurvey.xyz</p>
        </Modal>
      )}

      {/* PRIVACY */}
      {showPrivacy && (
        <Modal onClose={() => setShowPrivacy(false)} title="Privacy Policy">
          <p>
            We respect your privacy. We collect only necessary information to
            operate surveys, prevent fraud, and process rewards.
            We never sell personal data.
          </p>
        </Modal>
      )}

      {/* TERMS */}
      {showTerms && (
        <Modal onClose={() => setShowTerms(false)} title="Terms & Conditions">
          <p>
            US-SAAS Survey does not guarantee income or survey availability.
            Rewards depend on eligibility and successful completion.
            Abuse or fraud results in account termination.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* Reusable modal */
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
