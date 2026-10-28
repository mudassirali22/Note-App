import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = typeof state === "string" ? state : state?.email;
  const resetToken = typeof state === "object" ? state?.resetToken : null;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Those passwords don't match yet.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_PORT}/user/change-password/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, confirmPassword, resetToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn't update your password.");
      navigate("/login", { replace: true, state: { message: "Your password has been updated. Sign in with your new password." } });
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <AuthLayout eyebrow="SECURE PASSWORD RESET" title="Start again" description="Verify your email with a fresh code before choosing a new password." footer={<Link to="/forgot-password">Request a reset code <ArrowRight size={14} /></Link>}>
        <div className="form-alert" role="alert">Your reset session has expired or is incomplete.</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="ALMOST BACK IN"
      title="Choose a new password"
      description="Make it strong, memorable, and yours."
      footer={<Link to="/login">Back to sign in <ArrowRight size={14} /></Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="field-label" htmlFor="password">New password</label>
        <div className="input-shell">
          <LockKeyhole size={17} />
          <input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        <label className="field-label" htmlFor="confirmPassword">Confirm new password</label>
        <div className="input-shell">
          <LockKeyhole size={17} />
          <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Type it one more time" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </div>
        <p className="field-hint">Use 8+ characters with uppercase, lowercase, a number, and a symbol.</p>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Updating password..." : "Save new password"}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
