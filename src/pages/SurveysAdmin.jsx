import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API || "http://localhost:4000";

export default function SurveysAdmin() {
  const token = localStorage.getItem("token");

  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const [activeSurveyId, setActiveSurveyId] = useState(null);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("text");
  const [options, setOptions] = useState("");

  // ---------------- LOAD SURVEYS ----------------
  const loadSurveys = async () => {
    try {
      const res = await fetch(`${API}/api/admin/surveys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load surveys", err);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  // ---------------- CREATE SURVEY ----------------
  const createSurvey = async () => {
    if (!title || !reward) {
      alert("Title & reward required");
      return;
    }

    try {
      const res = await fetch(`${API}/api/admin/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          reward,
          estimated_time: estimatedTime || 10,
        }),
      });

      if (!res.ok) throw new Error("Create survey failed");

      setTitle("");
      setReward("");
      setEstimatedTime("");
      loadSurveys();
    } catch (err) {
      alert("Failed to create survey");
      console.error(err);
    }
  };

  // ---------------- ADD QUESTION ----------------
  const addQuestion = async () => {
    if (!activeSurveyId || !question) {
      alert("Select survey & enter question");
      return;
    }

    try {
      const res = await fetch(`${API}/api/admin/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          survey_id: activeSurveyId,
          question,
          type,
          options: type === "radio" ? JSON.stringify(options.split(",")) : null,
        }),
      });

      if (!res.ok) throw new Error("Add question failed");

      setQuestion("");
      setOptions("");
      alert("Question added");
      loadSurveys();
    } catch (err) {
      alert("Failed to add question");
      console.error(err);
    }
  };

  // ---------------- DELETE SURVEY ----------------
  const deleteSurvey = async (id) => {
    if (!window.confirm("Delete this survey?")) return;

    await fetch(`${API}/api/admin/surveys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadSurveys();
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>📊 Survey Administration</h2>

      {/* CREATE SURVEY */}
      <div className="card">
        <h3>Create Survey</h3>
        <input
          placeholder="Survey title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Reward (USD)"
          type="number"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
        />
        <input
          placeholder="Estimated time (minutes)"
          type="number"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
        />
        <button onClick={createSurvey}>Create Survey</button>
      </div>

      {/* ADD QUESTION */}
      <div className="card">
        <h3>Add Question</h3>

        <select
          value={activeSurveyId || ""}
          onChange={(e) => setActiveSurveyId(e.target.value)}
        >
          <option value="">Select Survey</option>
          {surveys.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        <input
          placeholder="Question text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="radio">Radio</option>
        </select>

        {type === "radio" && (
          <input
            placeholder="Options (comma separated)"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        )}

        <button onClick={addQuestion}>Add Question</button>
      </div>

      {/* SURVEY LIST */}
      <h3>Existing Surveys</h3>

      {surveys.length === 0 && <p>No surveys yet.</p>}

      {surveys.map((s) => (
        <div key={s.id} className="card">
          <h4>{s.title}</h4>
          <p>Reward: ${s.reward}</p>
          <p>Questions: {s.question_count}</p>
          <button onClick={() => deleteSurvey(s.id)}>🗑 Delete</button>
        </div>
      ))}
    </div>
  );
}
