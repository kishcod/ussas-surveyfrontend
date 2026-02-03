import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/withdrawp.css";

export default function WithdrawP() {
  const navigate = useNavigate();

  /* ===============================
     STATE
  =============================== */
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState(false);

  const USD_TO_KES = 125;

  /* ===============================
     LOAD BALANCE
  =============================== */
  useEffect(() => {
    try {
      // Pull from dashboard/localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      setBalance(Number(user.balance) || 0);
    } catch {
      setBalance(0);
    }
  }, []);

  /* ===============================
     M-PESA CONVERSION
  =============================== */
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
  const submitWithdraw = () => {
    setWithdrawError(false);

    // Validation checks
    if (!amount || Number(amount) <= 0) {
      setWithdrawError(true);
      return;
    }

    if (Number(amount) > balance) {
      setWithdrawError(true);
      return;
    }

    if (!method) {
      setWithdrawError(true);
      return;
    }

    if (method === "mpesa" && (!mpesaNumber || !mpesaAmount)) {
      setWithdrawError(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Randomly fail to simulate withdrawal
      if (Math.random() > 0.5) {
        setSuccess(true);
        setBalance((prev) => prev - Number(amount));
      } else {
        setWithdrawError(true);
      }
    }, 2000);
  };

  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h2>Withdraw Funds</h2>

        <p className="withdraw-balance">
          Available Balance<br />
          <strong>${balance.toFixed(2)}</strong>
        </p>

        {withdrawError && (
          <div className="withdraw-post-error">
            ⚠ Withdrawal failed. Check all fields and try again.
          </div>
        )}

        {!success ? (
          <>
            <input
              type="number"
              placeholder="Withdrawal amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                <p>You will receive <strong>{mpesaAmount} KES</strong></p>
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
            <h3>Withdrawal UnSuccessful!</h3>
            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
