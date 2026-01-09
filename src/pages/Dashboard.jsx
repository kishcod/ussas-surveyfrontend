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

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  const displayName = storedUser.username || storedUser.email || "Guest";
  const referralLink = `${window.location.origin}/signup?ref=${storedUser.username || ""}`;

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!token) return;
    fetchSurveys();
    fetchBalance();
    setProfilePhoto(storedUser.photo || null);
  }, []);

  const fetchSurveys = async () => {
    const res = await fetch(`${API}/api/surveys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSurveys(Array.isArray(data) ? data : []);
  };

  const fetchBalance = async () => {
    const res = await fetch(`${API}/api/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBalance(Number(data.balance) || 0);
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
    const res = await fetch(
      `${API}/api/surveys/${survey.id}/questions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const questions = await res.json();

    setActiveSurvey({ survey, questions });
    setAnswers({});
    setCurrentIndex(0);
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
      setLastReward(activeSurvey.survey.reward);
      setShowSurveyComplete(true);
      setActiveSurvey(null);
      setAnswers({});
      fetchBalance();
      fetchSurveys();
    } else {
      alert(data.message || "Submission failed");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-container">

      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div className="profile-section">
          <div
            className="profile-photo-wrapper"
            onClick={() => document.getElementById("photoInput").click()}
          >
            {profilePhoto ? (
              <img src={profilePhoto} className="profile-photo" />
            ) : (
              <div className="profile-placeholder">
                {displayName[0]}
              </div>
            )}
          </div>

          <input
            id="photoInput"
            type="file"
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
            <p>Referral Link</p>
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

        <div className="brand-bar">
          <img src={logo} className="brand-logo" />
          <h1>US SaaS Survey</h1>
        </div>

        <div className="balance-section">
          <h2>${balance.toFixed(2)}</h2>
          <button onClick={() => navigate("/withdraw")}>
            Withdraw
          </button>
        </div>
      </div>

      {/* ===== SURVEYS ===== */}
      {!activeSurvey ? (
        <div className="surveys-grid">
          {surveys.map((s) => (
            <div key={s.id} className="survey-card">
              <h3>{s.title}</h3>
              <p>💰 ${s.reward}</p>
              <p>⏱ {s.estimated_time || 10} min</p>
              <button onClick={() => openSurvey(s)}>
                Do Survey
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="survey-form">
          <h2>{activeSurvey.survey.title}</h2>

          {activeSurvey.questions
            .slice(currentIndex, currentIndex + 2)
            .map((q) => (
              <div key={q.id} className="survey-question">
                <label>{q.question}</label>

                {(q.type === "text" || q.type === "number") && (
                  <input
                    type={q.type}
                    className="survey-input"
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(q.id, e.target.value)
                    }
                  />
                )}

                {q.type === "radio" && (
                  <div className="radio-group">
                    {JSON.parse(q.options).map((opt, i) => (
                      <label key={i}>
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            handleAnswerChange(q.id, opt)
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "scale" && (
                  <div className="scale-options">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <label key={v}>
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          checked={answers[q.id] == v}
                          onChange={() =>
                            handleAnswerChange(q.id, v)
                          }
                        />
                        {v}
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
              <button onClick={submitSurvey}>Submit</button>
            )}
          </div>
        </div>
      )}

      {/* ===== COMPLETE MODAL ===== */}
      {showSurveyComplete && (
        <div className="survey-modal-overlay">
          <div className="survey-modal-card">
            <h2>🎉 Completed</h2>
            <p>Reward added</p>
            <strong>+${lastReward}</strong>
            <button onClick={() => setShowSurveyComplete(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
