const API = import.meta.env.VITE_API_URL;

export default API;


// REGISTER
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// LOGIN
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getSurveys() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:4000/api/surveys", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}


// COMPLETE SURVEY
export async function completeSurvey(user_id, survey_id) {
  const res = await fetch(`${API_URL}/api/complete-survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, survey_id }),
  });
  return res.json();
}

// GET BALANCE
export async function getBalance(user_id) {
  const res = await fetch(`${API_URL}/api/balance/${user_id}`);
  return res.json();
}

// WITHDRAW
export async function withdrawBalance(user_id, amount, method) {
  const res = await fetch(`${API_URL}/api/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, method }),
  });
  return res.json();
}
