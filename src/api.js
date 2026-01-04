const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export default API;

// REGISTER
export async function registerUser(data) {
  const res = await fetch(`${API}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// LOGIN
export async function loginUser(data) {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// GET SURVEYS
export async function getSurveys() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/surveys`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// COMPLETE SURVEY
export async function completeSurvey(user_id, survey_id) {
  const res = await fetch(`${API}/api/complete-survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, survey_id }),
  });
  return res.json();
}

// GET BALANCE
export async function getBalance(user_id) {
  const res = await fetch(`${API}/api/balance/${user_id}`);
  return res.json();
}

// WITHDRAW
export async function withdrawBalance(user_id, amount, method) {
  const res = await fetch(`${API}/api/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, method }),
  });
  return res.json();
}
