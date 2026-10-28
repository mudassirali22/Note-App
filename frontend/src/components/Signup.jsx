import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_PORT}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "We couldn't create your account.");

      navigate("/verify-otp", { state: { email: formData.email.trim().toLowerCase(), purpose: "signup" } });
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="START WITH A CLEAN SLATE"
      title="Create your account"
      description="A few details, then you're right where you need to be."
      footer={<>Already have a space here? <Link to="/login">Sign in <ArrowRight size={14} /></Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="field-label" htmlFor="userName">Your name</label>
        <div className="input-shell">
          <UserRound size={17} />
          <input id="userName" name="userName" type="text" autoComplete="name" placeholder="e.g. Ayesha Khan" minLength={3} maxLength={50} required value={formData.userName} onChange={handleChange} />
        </div>

        <label className="field-label" htmlFor="email">Email address</label>
        <div className="input-shell">
          <Mail size={17} />
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
        </div>

        <label className="field-label" htmlFor="password">Password</label>
        <div className="input-shell">
          <LockKeyhole size={17} />
          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required value={formData.password} onChange={handleChange} />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <p className="field-hint">Use 8+ characters with a mix of letters, numbers & symbols.</p>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Creating your space..." : "Create account"}
          {!loading && <ArrowRight size={17} />}
        </button>
        <p className="form-footnote">We'll email you a one-time code to verify your address.</p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
