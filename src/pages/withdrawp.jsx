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
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(false);

  const USD_TO_KES = 125;

  /* ===============================
     LOAD BALANCE FROM DASHBOARD
  =============================== */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setBalance(Number(user.balance) || 0);
  }, []);

  /* ===============================
     M-PESA CONVERSION
  =============================== */
  useEffect(() => {
    if (method === "mpesa" && amount) {
      setMpesaAmount((Number(amount) * USD_TO_KES).toFixed(0));
    } else {
      setMpesaAmount("");
    }
  }, [amount, method]);

  /* ===============================
     SUBMIT (FRONTEND ONLY)
  =============================== */
  const submitWithdraw = () => {
    setError(false);

    // Basic frontend validation
    if (!amount || Number(amount) <= 0) return setError(true);
    if (Number(amount) > balance) return setError(true);
    if (!method) return setError(true);

    if (method === "mpesa" && (!mpesaNumber || !mpesaAmount))
      return setError(true);

    if (method === "paypal" && !paypalEmail)
      return setError(true);

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowResult(true); // Always fail (frontend simulation)
    }, 2000);
  };

  return (
    <div className="withdraw-container-page">
      <div className="withdraw-container-page-card">
        <h2>Withdraw Funds</h2>

        <p className="withdraw-container-page-balance">
          Available Balance
          <br />
          <strong>${balance.toFixed(2)}</strong>
        </p>

        {error && (
          <div className="withdraw-container-page-error">
            ⚠ Please fill in all required fields correctly
          </div>
        )}

        {!showResult ? (
          <>
            <input
              type="number"
              placeholder="Withdrawal amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="withdraw-container-page-currency-select"
            >
              <option value="">Select payout method</option>
              <option value="mpesa">M-Pesa</option>
              <option value="paypal">PayPal</option>
              <option value="papara">Papara</option>
            </select>

            {/* M-PESA */}
            {method === "mpesa" && amount && (
              <div className="withdraw-container-page-conversion-box">
                <p className="fx-text">Live rate: 1 USD = 125 KES</p>
                <p>
                  You will receive <strong>{mpesaAmount} KES</strong>
                </p>
              </div>
            )}

            {method === "mpesa" && (
              <div className="withdraw-container-page-mpesa-box">
                <input type="number" value={mpesaAmount} readOnly />
                <input
                  type="tel"
                  placeholder="M-Pesa phone number"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                />
              </div>
            )}

            {/* PAYPAL */}
            {method === "paypal" && (
              <div className="withdraw-container-page-paypal-box">
                <input
                  type="email"
                  placeholder="PayPal email address"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                />
              </div>
            )}

            <button
              className="withdraw-container-page-continue-btn"
              onClick={submitWithdraw}
              disabled={loading}
            >
              {loading ? "Processing withdrawal..." : "Confirm Withdrawal"}
            </button>
          </>
        ) : (
          <div className="withdraw-container-page-processing">
            <div className="spinner" />
            <h3>Withdrawal successfull</h3>
            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
