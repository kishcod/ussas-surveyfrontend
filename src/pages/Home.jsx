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
           Privacy Policy

We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our platform, including participating in surveys, earning rewards, and requesting payouts. By using our services, you agree to the practices described in this policy.

Information We Collect

We collect only the information necessary to operate our services effectively and securely. This may include basic account information such as your username, email address, and country or region. When you participate in surveys, we may collect non-identifiable survey responses that help us improve our platform and provide insights to our partners.

To prevent fraud and abuse, we may also collect technical information such as IP address, device type, browser details, and activity logs. For payout processing, limited payment-related details (such as a mobile money number or payout method) may be required. We do not collect unnecessary personal data.

How We Use Your Information

The information we collect is used strictly for legitimate purposes, including:

Operating and maintaining the platform

Verifying user eligibility for surveys and rewards

Preventing fraud, abuse, and unauthorized access

Processing withdrawals and payouts

Improving platform performance and user experience

Complying with legal and regulatory obligations

We do not use your data for unrelated purposes.

Data Sharing and Disclosure

We take data sharing seriously. We do not sell, rent, or trade your personal information to third parties. Your data may only be shared in limited circumstances, such as:

With trusted service providers who assist with hosting, analytics, or payment processing

When required by law, regulation, or legal process

To protect the rights, safety, and security of our platform and users

Any third parties we work with are required to handle data responsibly and securely.

Data Security

We implement reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, or disclosure. While no system is completely secure, we continuously work to improve our security practices and limit access to sensitive data to authorized personnel only.

Cookies and Tracking Technologies

We may use cookies or similar technologies to enhance user experience, remember preferences, and analyze platform usage. These technologies do not collect sensitive personal information and can usually be controlled through your browser settings.

Your Rights and Choices

You have the right to access, update, or correct your account information. You may also request deletion of your account, subject to legal and operational requirements. If you have concerns about how your data is handled, you may contact us for clarification or assistance.

Policy Updates

We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. Any updates will be posted on this page, and continued use of the platform constitutes acceptance of the revised policy.

Contact Us

If you have questions or concerns about this Privacy Policy or how your data is handled, please contact us through our official support channels.
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
