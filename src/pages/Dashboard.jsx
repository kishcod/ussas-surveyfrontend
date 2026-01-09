import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/SurveyComplete.css";
import logo from "../assets/logo.png";
import API from "../api";

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [balance, setBalance] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showSurveyComplete, setShowSurveyComplete] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [balanceGlow, setBalanceGlow] = useState(false);


  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const displayName = storedUser.username || storedUser.email || "Guest";
  const referralLink = `${window.location.origin}/signup?ref=${storedUser.username || ""}`;

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!token) return;
    fetchSurveys();
    fetchBalance();
    setProfilePhoto(storedUser.photo || null);
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API}/api/surveys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API}/api/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBalance(Number(data.balance) || 0);
    } catch {
      setBalance(0);
    }
  };

  /* ================= PROFILE ================= */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo = reader.result;
      setProfilePhoto(photo);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, photo })
      );
    };
    reader.readAsDataURL(file);
  };

  /* ================= SURVEY ================= */
  const openSurvey = async (survey) => {
    try {
      const res = await fetch(
        `${API}/api/surveys/${survey.id}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const questions = await res.json();
      setActiveSurvey({ survey, questions });
      setAnswers({});
      setCurrentIndex(0);
    } catch {
      alert("Failed to open survey");
    }
  };

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const submitSurvey = async () => {
    const unanswered = activeSurvey.questions.filter(
      (q) => !answers[q.id]
    );
    if (unanswered.length) {
      alert("Please answer all questions");
      return;
    }

    const payload = activeSurvey.questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id],
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

      if (res.ok && data.success) {
        setLastReward(activeSurvey.survey.reward || 0);
        setShowSurveyComplete(true);
        setActiveSurvey(null);
        setAnswers({});
        fetchBalance();
        fetchSurveys();
      } else {
        alert(data.message || "Submission failed");
      }
    } catch {
      alert("Submission error");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="dashboard-container">

      {/* ===== HEADER ===== */}
      <div className="dashboard-header">

        {/* Profile */}
        <div className="profile-section">
          <div
            className="profile-photo-wrapper"
            onClick={() => document.getElementById("photoInput").click()}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="profile-photo" />
            ) : (
              <div className="profile-placeholder">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          <input
            type="file"
            id="photoInput"
            hidden
            onChange={handlePhotoUpload}
          />

          <h3>{displayName}</h3>

          <button
            className="profile-btn"
            onClick={() => setShowProfileModal(true)}
          >
            Profile ▾
          </button>

          <div className="referral-box">
            <p>Your Referral Link</p>
            <div className="referral-row">
              <input value={referralLink} readOnly />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  alert("Copied!");
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="brand-bar">
          <img src={logo} alt="Logo" className="brand-logo" />
          <h1>US SaaS Survey Educational Research</h1>
        </div>

        {/* Balance */}
        <div className="balance-section">
          <h2>Balance: ${balance.toFixed(2)}</h2>
          <button
            className="withdraw-btn"
            onClick={() =>
              navigate("/withdraw", {
                state: {
                  balance,
                  profilePhoto,
                  username: displayName,
                },
              })
            }
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* ===== SURVEYS ===== */}
      {!activeSurvey ? (
        <>
          <h2 className="section-title">Available Surveys</h2>
          <div className="surveys-grid">
            {surveys.length ? (
              surveys.map((s) => (
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
              <p className="no-surveys-msg">
                No surveys available at the moment.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="survey-form">

          <div className="survey-progress">
            Page {Math.floor(currentIndex / 2) + 1} of{" "}
            {Math.ceil(activeSurvey.questions.length / 2)}
          </div>

          <h2>{activeSurvey.survey.title}</h2>

          {activeSurvey.questions
            .slice(currentIndex, currentIndex + 2)
            .map((q) => (
              <div key={q.id} className="survey-question">
                <label>{q.question}</label>

                {(q.type === "text" || q.type === "number") && (
                  <input
                    className="survey-input"
                    type={q.type}
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(q.id, e.target.value)
                    }
                  />
                )}

                {q.type === "radio" && (
                  <div className="radio-group">
                    {JSON.parse(q.options).map((opt, i) => (
                      <label key={i} className="radio-option">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            handleAnswerChange(q.id, opt)
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "scale" && (
                  <div className="scale-options">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <label key={v} className="scale-option">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={answers[q.id] == v}
                          onChange={() =>
                            handleAnswerChange(q.id, v)
                          }
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

          <div className="survey-buttons">
            {currentIndex > 0 && (
              <button onClick={() => setCurrentIndex(currentIndex - 2)}>
                Previous
              </button>
            )}

            {currentIndex + 2 < activeSurvey.questions.length ? (
              <button onClick={() => setCurrentIndex(currentIndex + 2)}>
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

      {/* ===== SURVEY COMPLETE MODAL ===== */}
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
              Your reward has been credited.
            </div>
            <div className="survey-reward">
              + ${Number(lastReward).toFixed(2)}
            </div>
            <button
              className="survey-button"
              onClick={() => setShowSurveyComplete(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== PROFILE MODAL ===== */}
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
            <input className="profile-input" placeholder="Full Name" />
            <input className="profile-input" placeholder="Location" />
            <input className="profile-input" placeholder="ID Number" />
            <textarea
              className="profile-textarea"
              placeholder="Other info"
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
    </div>
  );
}
