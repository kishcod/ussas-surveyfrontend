import React from "react";
import "../styles/Surveycomplete.css";

export default function SurveyComplete({ reward, onClose }) {
  return (
    <div className="survey-modal-overlay">
      <div className="survey-modal-card">
        <div className="survey-emoji">🎉</div>
        <h1 className="survey-title">Survey Completed!</h1>
        <p className="survey-message">
          Thank you for your time. Your reward has been successfully credited.
        </p>
        <div className="survey-reward">
          + ${Number(reward).toFixed(2)} added to your balance
        </div>
        <button className="survey-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
