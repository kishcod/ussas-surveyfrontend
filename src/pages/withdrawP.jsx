import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Withdrawp.css";
import API from "../api";

export default function Withdraw() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const balance = state?.balance || 0;
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (Number(amount) > balance) {
      alert("Insufficient balance");
      return;
    }

    if (method === "mpesa" && (!mpesaNumber || !mpesaAmount)) {
      alert("Enter M-Pesa amount and phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          method,
          mpesa_number: mpesaNumber,
          mpesa_amount: mpesaAmount
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Withdraw failed");

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
          Available Balance: <strong>${balance.toFixed(2)}</strong>
        </p>

        {!success ? (
          <>
            <input
              type="number"
              placeholder="Amount to withdraw (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
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
            <div className="spinner"></div>
            <h3>Withdrawal Processing</h3>
            <p>
              Your request has been received.  
              Please wait while we process your payout.
            </p>

            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
