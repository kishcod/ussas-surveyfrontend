import React, { useEffect, useState } from "react";
import API from "../api";

export default function SurveysAdmin() {
  const token = localStorage.getItem("token");

  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const [activeSurveyId, setActiveSurveyId] = useState(null);

  // Dynamic questions
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [questionOptions, setQuestionOptions] = useState("");

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
    if (!title || !reward) return alert("Title & reward required");

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
      alert("Survey created! Now add questions.");
    } catch (err) {
      alert("Failed to create survey");
      console.error(err);
    }
  };

  // ---------------- ADD DYNAMIC QUESTION ----------------
  const stageQuestion = () => {
    if (!questionText) return alert("Enter question text");

    const q = {
      text: questionText,
      type: questionType,
      options:
        questionType === "radio" ? questionOptions.split(",").map((o) => o.trim()) : null,
    };

    setQuestions([...questions, q]);
    setQuestionText("");
    setQuestionOptions("");
  };

  const removeStagedQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // ---------------- POST QUESTIONS ----------------
  const postQuestions = async () => {
    if (!activeSurveyId || questions.length === 0)
      return alert("Select survey and stage questions first");

    try {
      for (const q of questions) {
        await fetch(`${API}/api/admin/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            survey_id: activeSurveyId,
            question: q.text,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
          }),
        });
      }
      alert("All questions posted!");
      setQuestions([]);
      loadSurveys();
    } catch (err) {
      alert("Failed to post questions");
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
        <input placeholder="Survey title" value={title} onChange={(e) => setTitle(e.target.value)} />
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

      {/* ADD QUESTIONS */}
      <div className="card">
        <h3>Add Questions</h3>
        <select value={activeSurveyId || ""} onChange={(e) => setActiveSurveyId(e.target.value)}>
          <option value="">Select Survey</option>
          {surveys.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        <input
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="radio">Radio</option>
          <option value="scale">Scale 1-5</option>
        </select>

        {questionType === "radio" && (
          <input
            placeholder="Options (comma separated)"
            value={questionOptions}
            onChange={(e) => setQuestionOptions(e.target.value)}
          />
        )}

        <button onClick={stageQuestion}>Stage Question</button>

        {questions.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <h4>Staged Questions</h4>
            <ul>
              {questions.map((q, idx) => (
                <li key={idx}>
                  {q.text} ({q.type})
                  {q.options && ` - [${q.options.join(", ")}]`}
                  <button onClick={() => removeStagedQuestion(idx)}>Remove</button>
                </li>
              ))}
            </ul>
            <button onClick={postQuestions}>Post All Questions</button>
          </div>
        )}
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
