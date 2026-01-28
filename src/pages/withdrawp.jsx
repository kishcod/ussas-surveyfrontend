import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/withdrawp.css";
import API from "../api";

export default function WithdrawP() {
  const navigate = useNavigate();

  // 🔹 User balance & token (FORCED numbers)
  const [balance, setBalance] = useState(0);
  const [token, setToken] = useState("");

  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : {};

      setBalance(Number(user.balance) || 0);
      setToken(localStorage.getItem("token") || "");
    } catch (err) {
      console.error("Failed to load user:", err);
      setBalance(0);
    }
  }, []);

  // 🔹 Form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔹 Submit withdrawal
  const submitWithdraw = async () => {
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Enter a valid withdrawal amount");
      return;
    }

    if (withdrawAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    if (method === "mpesa") {
      if (!mpesaNumber || !mpesaAmount || Number(mpesaAmount) <= 0) {
        alert("Enter valid M-Pesa details");
        return;
      }
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          mpesa_number: mpesaNumber,
          mpesa_amount: Number(mpesaAmount) || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2>Withdraw Funds</h2>

        <p className="withdraw-balance">
          Available Balance:{" "}
          <strong>${balance.toFixed(2)}</strong>
        </p>

        {!success ? (
          <>
            <input
              type="number"
              placeholder="Amount to withdraw (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />

            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">Select payout method</option>
              <option value="mpesa">M-Pesa</option>
              <option value="paypal">PayPal</option>
              <option value="papara">Papara</option>
            </select>

            {method === "mpesa" && (
              <div className="mpesa-box">
                <input
                  type="number"
                  placeholder="Amount in KES"
                  value={mpesaAmount}
                  onChange={(e) => setMpesaAmount(e.target.value)}
                  min="0"
                />
                <input
                  type="tel"
                  placeholder="M-Pesa phone number"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                />
              </div>
            )}

            <button onClick={submitWithdraw} disabled={loading}>
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </>
        ) : (
          <div className="withdraw-processing">
            <div className="spinner" />
            <h3>Withdrawal Request Submitted</h3>
            <p>Your request has been received. Processing payout…</p>
            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

