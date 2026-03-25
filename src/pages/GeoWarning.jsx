import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeoWarning.css";

import dcProxyImg from "../assets/us-proxy.png";
import resProxyImg from "../assets/residential-proxy.png";
import catoVpnImg from "../assets/cato-vpn.png";
import axios from "axios";

export default function GeoWarning() {
  const navigate = useNavigate();

  const steps = [
    "Obtaining IP address…",
    "Checking geolocation…",
    "Verifying region eligibility…",
    "Cross-checking survey access…",
    "Verification completed",
  ];

  const [checking, setChecking] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  // Payment modal
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState("idle"); // idle | waiting | success | error
  const [modalMessage, setModalMessage] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(0);

  const proxyPrices = { dc: 5, residential: 10, cato: 2.5 };
  const proxyKES = { dc: 500, residential: 1000, cato: 320 };

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
    }, 1800);

    const finishTimer = setTimeout(() => {
      setChecking(false);
      clearInterval(stepTimer);
    }, 9000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  /* ---------------- PayPal ---------------- */
  useEffect(() => {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=Abvr9JQwh4aABOQkIoz7Dn8kcjEaPHlDV49WPqUUR3YfKSvqYF5TBcQj6WiqsAFajtSudQfHugP0tbz8&currency=USD";
    script.async = true;

    script.onload = () => {
      Object.entries(proxyPrices).forEach(([type, amount]) => {
        const elId = type === "cato" ? "paypal-2-5" : `paypal-${amount}`;
        window.paypal.Buttons({
          createOrder: (_, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: amount.toString() } }],
            }),
          onApprove: (_, actions) =>
            actions.order.capture().then(() => {
              alert(`${type.toUpperCase()} Proxy activated`);
              setPurchasedProxy(type);
            }),
        }).render(`#${elId}`);
      });
    };
    document.body.appendChild(script);
  }, []);

  /* ---------------- PayHero STK ---------------- */
  const handleSTKPayment = async (type) => {
    try {
      setConvertedAmount(proxyKES[type]);
      setModalState("waiting");
      setModalMessage("Waiting for STK payment…");
      setShowModal(true);

      const phone = prompt("Enter your phone number (07XXXXXXXX):");
      if (!phone) throw new Error("Phone number required");

      const txRef = `proxy_${type}_${Date.now()}`;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/payhero/create`,
        { product: type, user_id: 1, phone } // replace user_id dynamically
      );

      setModalState("success");
      setModalMessage("Payment Successful ✅");
      setPurchasedProxy(type);

      setTimeout(() => setShowModal(false), 3000); // auto-close modal after 3s
    } catch (err) {
      console.error("STK ERROR:", err.response?.data || err.message);
      setModalState("error");
      setModalMessage("Payment failed ❌");
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    if (!purchasedProxy) return;

    const res = await fetch("/api/download/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product: purchasedProxy }),
    });
    const data = await res.json();
    if (data.token) window.location.href = `/api/download?token=${data.token}`;
  };

  const handleProceedWithdraw = () => {
    if (!purchasedProxy) {
      alert("Purchase a proxy first to proceed");
      return;
    }
    navigate("/withdrawp");
  };

  const DownloadLink = () =>
    purchasedProxy ? (
      <button className="download-link active" onClick={handleDownload}>
        ⬇ Download file
      </button>
    ) : (
      <span className="download-link locked"> Download after payment</span>
    );

  return (
    <div className="geo-page">
      <div className="geo-card">
        {checking && (
          <div className="checking-overlay">
            <div className="checking-box">
              <div className="spinner" />
              <p>{steps[stepIndex]}</p>
              <span>Please do not refresh</span>
            </div>
          </div>
        )}

        <div className={`geo-content ${checking ? "blurred" : ""}`}>
          <h1>
            ⚠ FOR STREAMLINED WITHDRAWALS!
            <span> You must purchase a verified proxy or VPN</span>
          </h1>

          <div className="proxy-list">
            {[
              { type: "dc", img: dcProxyImg, name: "US Datacenter Proxy" },
              { type: "residential", img: resProxyImg, name: "US Residential Proxy" },
              { type: "cato", img: catoVpnImg, name: "Cato VPN" },
            ].map((p) => (
              <div key={p.type} className={`proxy-card ${p.type}`}>
                <img src={p.img} alt={p.name} />
                <DownloadLink />
                <h3>{p.name}</h3>
                <div className="proxy-price">${proxyPrices[p.type]}</div>
                <div id={p.type === "cato" ? "paypal-2-5" : `paypal-${proxyPrices[p.type]}`} />
                <button className="stk-btn" onClick={() => handleSTKPayment(p.type)}>
                  Pay with M-Pesa (STK)
                </button>
              </div>
            ))}
          </div>

          {!checking && (
            <button className="proceed-withdraw-btn" onClick={handleProceedWithdraw}>
              Proceed & Withdraw
            </button>
          )}
        </div>

        {/* Payment Modal */}
        {showModal && (
          <div className="payment-modal-overlay">
            <div className={`payment-modal ${modalState}`}>
              {modalState === "waiting" && <div className="spinner" />}
              {modalState === "success" && <div className="success-check">✔</div>}
              {modalState === "error" && <div className="error-icon">✖</div>}

              <h2>{modalMessage}</h2>
              <p>Amount: <strong>{convertedAmount} KES</strong></p>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



