import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/withdrawp.css";
import API from "../api";

export default function WithdrawP() {
  const navigate = useNavigate();

  /* ===============================
     USER DATA
  =============================== */
  const [balance, setBalance] = useState(0);
  const [token, setToken] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      setBalance(Number(user.balance) || 0);
      setToken(localStorage.getItem("token") || "");
    } catch {
      setBalance(0);
    }
  }, []);

  /* ===============================
     FORM STATE
  =============================== */
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ===============================
     LOCAL CONVERSION
  =============================== */
  const USD_TO_KES = 125;

  useEffect(() => {
    if (method === "mpesa" && amount) {
      const converted = Number(amount) * USD_TO_KES;
      setMpesaAmount(converted ? converted.toFixed(0) : "");
    } else {
      setMpesaAmount("");
    }
  }, [amount, method]);

  /* ===============================
     SUBMIT
  =============================== */
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

    if (method === "mpesa" && (!mpesaNumber || !mpesaAmount)) {
      alert("Enter valid M-Pesa details");
      return;
    }

    try {
      setLoading(true);

      await fetch(`${API}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          mpesa_number: mpesaNumber,
          mpesa_amount: Number(mpesaAmount),
        }),
      });

      // deduct locally
      setBalance((prev) => prev - withdrawAmount);

      // fake processing delay
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 2000);
    } catch (err) {
      alert("Withdrawal failed");
      setLoading(false);
    }
  };

  /* ===============================
     JSX
  =============================== */
  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2>Withdraw Funds</h2>

        <p className="withdraw-balance">
          Available Balance
          <br />
          <strong>${balance.toFixed(2)}</strong>
        </p>

        {!success ? (
          <>
            <input
              type="number"
              placeholder="Withdrawal amount (USD)"
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

            {method === "mpesa" && amount && (
              <div className="conversion-text">
                <p>Rate: 1 USD = 125 KES</p>
                <p>
                  You will receive <strong>{mpesaAmount} KES</strong>
                </p>
              </div>
            )}

            {method === "mpesa" && (
              <div className="mpesa-box">
                <input
                  type="number"
                  value={mpesaAmount}
                  placeholder="Amount in KES"
                  readOnly
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
              {loading ? "Processing withdrawal..." : "Withdraw"}
            </button>
          </>
        ) : (
          <div className="withdraw-processing">
            <div className="spinner" />
            <h3>Processing Withdrawal</h3>
            <p>Please wait while we complete your payout.</p>
            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

