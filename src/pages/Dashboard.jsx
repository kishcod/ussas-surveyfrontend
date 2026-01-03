import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Surveycomplete.css";
import logo from "../assets/logo.png"; // Make sure your logo.png is in src/assets

const API = import.meta.env.VITE_API || "http://localhost:4000";

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [balance, setBalance] = useState(0);
  const [balanceGlow, setBalanceGlow] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showSurveyComplete, setShowSurveyComplete] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);



  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const displayName = storedUser.username || storedUser.email || "Guest";

  // Auto-generate referral link
  const referralLink = `${window.location.origin}/signup?ref=${storedUser.username || ""}`;

  useEffect(() => {
    if (!storedUser.id || !token) return;
    fetchSurveys();
    fetchBalance();
    setProfilePhoto(storedUser.photo || null);
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API}/api/surveys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load surveys");
      const data = await res.json();
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading surveys:", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API}/api/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch balance");
      const data = await res.json();
      setBalance(Number(data.balance) || 0);
    } catch (err) {
      console.error("Error loading balance:", err);
      setBalance(0);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = reader.result;
      setProfilePhoto(photoUrl);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, photo: photoUrl })
      );
    };
    reader.readAsDataURL(file);
  };

  const openSurvey = async (survey) => {
    try {
      const res = await fetch(`${API}/api/surveys/${survey.id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load questions");

      const questions = await res.json();
      setActiveSurvey({ survey, questions });
      setAnswers({});
    } catch (err) {
      console.error("Error opening survey:", err);
      alert("Failed to open survey");
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitSurvey = async () => {
    if (!activeSurvey) return;
    const unanswered = activeSurvey.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting!");
      return;
    }

    const payload = Object.entries(answers).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    try {
      const res = await fetch(
        `${API}/api/surveys/${activeSurvey.survey.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: payload }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setLastReward(activeSurvey.survey.reward || 0);
        setShowSurveyComplete(true);
        setBalanceGlow(true);
        setTimeout(() => setBalanceGlow(false), 1500);

        setActiveSurvey(null);
        setAnswers({});
        fetchBalance();
        fetchSurveys();
      } else {
        alert(data.error || "Failed to submit survey");
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
      alert("Failed to submit survey");
    }
  };

  const handleWithdraw = () => {
    navigate("/withdraw", {
      state: { balance, profilePhoto, username: displayName },
    });
  };

  return (
    <div className="dashboard-container app-root">
  
      {/* ===== HEADER ===== */}
<div className="dashboard-header">
  {/* Left: Profile + referral */}
  <div className="profile-section">
    <div className="divider"></div>
    <div className="profile-photo-wrapper" onClick={() => document.getElementById("photoInput").click()}>
      {profilePhoto ? (
        <img src={profilePhoto} alt="Profile" className="profile-photo" />
      ) : (
        <div className="profile-placeholder">{displayName[0].toUpperCase()}</div>
      )}
    </div>
    <input
      type="file"
      id="photoInput"
      style={{ display: "none" }}
      onChange={handlePhotoUpload}
    />
    <h3>{displayName}</h3>
    {/* Profile dropdown trigger */}
<button
  className="profile-btn"
  onClick={() => setShowProfileModal(true)}
>
  Profile ▾
</button>

{/* PROFILE MODAL */}
{showProfileModal && (
  <div
    className="profile-modal-overlay"
    onClick={() => setShowProfileModal(false)}
  >
    <div
      className="profile-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Profile & KYC</h3>

      <input
        type="text"
        placeholder="Full Name"
        className="profile-input"
      />

      <input
        type="text"
        placeholder="Location / Address"
        className="profile-input"
      />

      <input
        type="text"
        placeholder="Alien ID / National ID"
        className="profile-input"
      />

      <label className="upload-label">
        Upload ID Document
        <input type="file" hidden />
      </label>

      <textarea
        placeholder="Other KYC Information"
        className="profile-textarea"
      />

      <div className="profile-actions">
        <button
          className="save-btn"
          onClick={() => setShowProfileModal(false)}
        >
          Save
        </button>
        <button
          className="cancel-btn"
          onClick={() => setShowProfileModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    <div className="referral-box">
      <p>Your Referral Link (Earn $5 per referral)</p>
      <div className="referral-row">
        <input type="text" value={referralLink} readOnly className="referral-input" />
        <button onClick={() => { navigator.clipboard.writeText(referralLink); alert("Referral link copied!"); }}>
          Copy
        </button>
      </div>
    </div>
  </div>

  {/* Center: Logo + heading */}
  <div className="brand-bar">
    <img src={logo} alt="Logo" className="brand-logo" />
    <h1 className="brand-title">US SaaS Survey Educational research
    
    </h1>
  </div>

  {/* Right: Balance */}
  <div className="balance-section">
    <h2 className="balance-glow">Balance: ${balance.toFixed(2)}</h2>
    <button className="withdraw-btn" onClick={handleWithdraw}>Withdraw</button>
  </div>
</div>

      {/* ===== SURVEYS ===== */}
     {!activeSurvey ? (
  <>
    <h2 className="section-title">Available Surveys:</h2>
    <div className="surveys-grid">
      {surveys.length > 0 ? (
        surveys.map(s => (
          <div key={s.id} className="survey-card">
            <h3>{s.title}</h3>
            <p>💰 Reward: ${s.reward}</p>
            <p>⏱ Estimated time: {s.estimated_time || 10} min</p>
            <button
  className="do-survey-btn"
  onClick={() => openSurvey(s)}
>
  Do Survey
</button>

          </div>
        ))
      ) : (
        <p className="no-surveys-msg">No surveys available at the moment.</p>
      )}
    </div>
  </>
) : (
  <div className="survey-form">
  {/* Progress */}
  <div className="survey-progress">
    Page {Math.floor(currentIndex / 2) + 1} of{" "}
    {Math.ceil(activeSurvey.questions.length / 2)}
  </div>

  <h2>{activeSurvey.survey.title}</h2>

  {/* Show 2 questions per page */}
  {activeSurvey.questions
    .slice(currentIndex, currentIndex + 2)
    .map((q) => (
      <div key={q.id} className="survey-question">
        <label>{q.question}</label>

        {q.type === "text" || q.type === "number" ? (
          <input
            type={q.type}
            value={answers[q.id] || ""}
            onChange={(e) =>
              handleAnswerChange(q.id, e.target.value)
            }
          />
        ) : q.type === "radio" && q.options ? (
          JSON.parse(q.options).map((opt, idx) => (
            <label key={idx} className="radio-option">
              <input
                type="radio"
                name={`q${q.id}`}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={(e) =>
                  handleAnswerChange(q.id, e.target.value)
                }
              />
              {opt}
            </label>
          ))
        ) : null}
      </div>
    ))}

  {/* Navigation buttons */}
  <div className="survey-buttons">
    {currentIndex > 0 && (
      <button
        className="prev-btn"
        onClick={() => setCurrentIndex(currentIndex - 2)}
      >
        Previous
      </button>
    )}

    {currentIndex + 2 < activeSurvey.questions.length ? (
      <button
        className="next-btn"
        onClick={() => setCurrentIndex(currentIndex + 2)}
      >
        Next
      </button>
    ) : (
      <button className="submit-btn" onClick={submitSurvey}>
        Submit Survey
      </button>
    )}

    <button
      className="cancel-btn"
      onClick={() => {
        setActiveSurvey(null);
        setAnswers({});
        setCurrentIndex(0);
      }}
    >
      Cancel
    </button>
  </div>
</div>
)}

     
      {showSurveyComplete && (
        <div
          className="survey-modal-overlay"
          onClick={() => setShowSurveyComplete(false)}
        >
          <div
            className="survey-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="survey-emoji">🎉</div>
            <div className="survey-title">Survey Completed!</div>
            <div className="survey-message">
              Thank you for your time. Your reward has been credited.
            </div>
            <div className="survey-reward">+ ${Number(lastReward).toFixed(2)}</div>
            <button
              className="survey-button"
              onClick={() => setShowSurveyComplete(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
