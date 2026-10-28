import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_PORT}/user/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn't send your reset code.");

      navigate("/verify-otp", { state: { email: email.trim().toLowerCase(), purpose: "password-reset" } });
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="NO WORRIES, IT HAPPENS"
      title="Let's get you back in"
      description="Share the email on your account and we'll send a code to reset your password."
      footer={<Link to="/login">Back to sign in <ArrowRight size={14} /></Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="field-label" htmlFor="email">Email address</label>
        <div className="input-shell">
          <Mail size={17} />
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Sending your code..." : "Send reset code"}
          {!loading && <ArrowRight size={17} />}
        </button>
        <p className="form-footnote">For your security, only the account owner can reset a password.</p>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;
