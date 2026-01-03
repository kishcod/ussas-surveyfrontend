import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/withdraw.css";

export default function Withdraw() {
  const { state } = useLocation();
  const nav = useNavigate();

  const balance = state?.balance || 0;
  const username = state?.username || "User";
  const profilePhoto = state?.profilePhoto || null;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("paypal");
  const [currency, setCurrency] = useState("KES");

  const [converted, setConverted] = useState(null);
  const [loadingFx, setLoadingFx] = useState(false);
  const [fxError, setFxError] = useState(false);

  // 🔹 LIVE FX CONVERSION
  useEffect(() => {
    if (!amount || amount <= 0) {
      setConverted(null);
      return;
    }

    const controller = new AbortController();

    const fetchFx = async () => {
      try {
        setLoadingFx(true);
        setFxError(false);

        const res = await fetch(
         `http://localhost:4000/api/fx/convert?amount=${amount}&to=${currency}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (!res.ok || data.error) throw new Error();

        setConverted(data.converted);
      } catch {
        setFxError(true);
        setConverted(null);
      } finally {
        setLoadingFx(false);
      }
    };

    fetchFx();
    return () => controller.abort();
  }, [amount, currency]);

  const submit = () => {
    if (!amount || amount < 20) {
      return alert("Minimum withdrawal is $20");
    }

    nav("/geo-warning", {
      state: {
        amount,
        method,
        currency,
        type: "withdraw",
      },
    });
  };

  const withdrawalMethods = [
    { key: "paypal", name: "PayPal", icon: "💸" },
    { key: "airtm", name: "AirTM", icon: "📱" },
    { key: "papara", name: "Papara", icon: "🏦" },
    { key: "mpesa", name: "M-Pesa", icon: "💰" },
  ];

  return (
    <div className="withdraw-page">

      {/* PROFILE */}
      <div className="withdraw-header">
        <div className="profile-row">
          <div className="profile-photo-wrapper">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="profile-photo" />
            ) : (
              <div className="profile-placeholder">
                {username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2>{username}</h2>
            <span className="balance">Balance: ${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* WITHDRAW CARD */}
      <div className="withdraw-card">
        <h2>Withdraw Funds</h2>

        <input
          type="number"
          placeholder="Enter amount (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* CURRENCY SELECT */}
        <select
          className="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="KES">KES – Kenya</option>
          <option value="NGN">NGN – Nigeria</option>
          <option value="UGX">UGX – Uganda</option>
          <option value="TZS">TZS – Tanzania</option>
        </select>

        {/* FX DISPLAY */}
{amount && (
  <div
    className={`conversion-box ${
      loadingFx ? "loading" : fxError ? "error" : converted ? "success" : ""
    }`}
  >
    {loadingFx && <span className="fx-text">Converting…</span>}
    {fxError && <span className="fx-text">FX unavailable</span>}
    {!loadingFx && converted && (
      <span className="fx-text">
        ≈ <strong>{converted}</strong> {currency}
      </span>
    )}
  </div>
)}

        <div className="methods">
          {withdrawalMethods.map((m) => (
            <button
              key={m.key}
              className={method === m.key ? "active" : ""}
              onClick={() => setMethod(m.key)}
            >
              <span className="method-icon">{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        <button className="continue-btn" onClick={submit}>
          Continue
        </button>
      </div>
    </div>
  );
}
