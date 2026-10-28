import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const CODE_LENGTH = 6;

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const email = typeof state === "string" ? state : state?.email;
  const purpose = typeof state === "string" ? "password-reset" : state?.purpose || "password-reset";
  const isSignupVerification = purpose === "signup";
  const [otp, setOtp] = useState(Array(CODE_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate(isSignupVerification ? "/" : "/forgot-password", { replace: true });
    }
  }, [email, isSignupVerification, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const updateOtp = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setOtp((current) => current.map((digit, position) => position === index ? "" : digit));
      return;
    }

    const next = [...otp];
    digits.slice(0, CODE_LENGTH - index).split("").forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setOtp(next);
    inputRefs.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== CODE_LENGTH) {
      setError("Enter all 6 digits to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const endpoint = isSignupVerification
        ? `${import.meta.env.VITE_PORT}/user/verify-signup-otp`
        : `${import.meta.env.VITE_PORT}/user/verify-otp/${encodeURIComponent(email)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignupVerification ? { email, otp: code } : { otp: code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "That code couldn't be verified.");

      if (isSignupVerification) {
        localStorage.setItem("token", data.accessToken);
        navigate("/dashboard", { replace: true });
        return;
      }

      setMessage("Code verified. You can now choose a new password.");
      window.setTimeout(() => navigate("/change-password", {
        state: { email, resetToken: data.resetToken },
      }), 700);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const endpoint = isSignupVerification
        ? `${import.meta.env.VITE_PORT}/user/resend-signup-otp`
        : `${import.meta.env.VITE_PORT}/user/forget-password`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Couldn't send another code.");
      setOtp(Array(CODE_LENGTH).fill(""));
      setCooldown(60);
      setMessage("A fresh code is on its way. Check your inbox.");
      inputRefs.current[0]?.focus();
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={isSignupVerification ? "ONE LAST LITTLE STEP" : "SECURE PASSWORD RESET"}
      title={isSignupVerification ? "Check your inbox" : "Enter your code"}
      description={isSignupVerification ? "We sent a 6-digit sign-in code to verify your email." : "Enter the 6-digit code we sent so you can reset your password."}
      footer={<Link to={isSignupVerification ? "/login" : "/forgot-password"}><ArrowLeft size={14} /> {isSignupVerification ? "Back to sign in" : "Change email address"}</Link>}
    >
      <div className="otp-recipient">
        <span className="otp-mail-icon"><MailCheck size={19} /></span>
        <span><small>CODE SENT TO</small><strong>{email}</strong></span>
      </div>

      <form className="auth-form otp-form" onSubmit={handleSubmit}>
        {message && <div className="form-success" role="status">{message}</div>}
        {error && <div className="form-alert" role="alert">{error}</div>}

        <label className="field-label" htmlFor="otp-digit-0">Your 6-digit code</label>
        <div className="otp-inputs" role="group" aria-label="6-digit verification code">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-digit-${index}`}
              ref={(element) => { inputRefs.current[index] = element; }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              aria-label={`Digit ${index + 1}`}
              value={digit}
              onChange={(event) => updateOtp(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onFocus={(event) => event.target.select()}
            />
          ))}
        </div>
        <p className="field-hint">The code is valid for 10 minutes. Check your spam folder if it isn't in your inbox.</p>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Checking your code..." : isSignupVerification ? "Verify & open my space" : "Verify code"}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <div className="resend-row">
        <span>Didn't get the email?</span>
        <button type="button" onClick={handleResend} disabled={resending || cooldown > 0}>
          {resending ? "Sending..." : cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, "0")}` : "Send a new code"}
        </button>
      </div>
    </AuthLayout>
  );
};

export default OtpVerification;
