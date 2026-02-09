import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram
} from "react-icons/fa";
import "../styles.css";

const activitySamples = [
  "Sarah from TX just joined",
  "Michael from CA completed a survey",
  "Angela from NY earned $8",
  "David from FL signed up",
  "Chris from AZ earned rewards",
];

export default function Home() {
  const nav = useNavigate();

  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [users, setUsers] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [activity, setActivity] = useState(activitySamples[0]);

  // Count-up animation
  useEffect(() => {
    let u = 0;
    let e = 0;

    const interval = setInterval(() => {
      if (u < 10000) setUsers(u += 120);
      if (e < 250000) setEarnings(e += 2500);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Live activity ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const random =
        activitySamples[Math.floor(Math.random() * activitySamples.length)];
      setActivity(random);
    }, 3000);

    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="landing-container">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-left">
          <span onClick={() => setShowAbout(true)}>About</span>
          <span onClick={() => setShowContact(true)}>Contact</span>
        </div>
        <div className="nav-right">
          <button onClick={() => nav("/login")} className="btn ghost">Login</button>
          <button onClick={() => nav("/signup")} className="btn primary">Sign Up</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="landing-card fade-in">
        <h1>US-SAAS Survey</h1>
        <p className="subtitle">
          Earn rewards by completing short surveys. 100% free.
        </p>

        {/* TRUST STATS */}
        <div className="stats">
          <div>
            <h2>{users.toLocaleString()}+</h2>
            <p>U.S. users registered</p>
          </div>
          <div>
            <h2>${earnings.toLocaleString()}+</h2>
            <p>Rewards paid</p>
          </div>
        </div>

        {/* LIVE ACTIVITY */}
        <div className="activity-ticker pulse">
          🔔 {activity}
        </div>

        <button className="cta-primary" onClick={() => nav("/signup")}>
          Start Earning Free
        </button>

        <p className="note">
          Available to U.S. residents 18+ • No guaranteed income
        </p>

        {/* HOW IT WORKS */}
        <div className="how">
          <div className="step">1. Create an account</div>
          <div className="step">2. Choose surveys</div>
          <div className="step">3. Earn rewards</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="socials">
          <FaFacebookF />
          <FaLinkedinIn />
          <FaTwitter />
          <FaInstagram />
        </div>

        <div className="links">
          <span onClick={() => setShowPrivacy(true)}>Privacy</span> •
          <span onClick={() => setShowTerms(true)}>Terms</span>
        </div>

        <p>© {new Date().getFullYear()} US-SAAS Survey</p>
      </footer>

      {/* MODALS */}
      {showAbout && <Modal title="About" onClose={() => setShowAbout(false)}>
        US-SAAS Survey connects U.S. residents with legitimate market research opportunities.
      </Modal>}

      {showContact && <Modal title="Contact" onClose={() => setShowContact(false)}>
        support@ussassurvey.xyz
      </Modal>}

      {showPrivacy && <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
        We collect only necessary data. No selling of personal information.
      </Modal>}

      {showTerms && <Modal title="Terms" onClose={() => setShowTerms(false)}>
        Rewards depend on eligibility and survey availability.
      </Modal>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{children}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
