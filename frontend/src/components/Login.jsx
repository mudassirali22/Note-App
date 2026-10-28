import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const response = await fetch(`${import.meta.env.VITE_PORT}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.code === "EMAIL_VERIFICATION_REQUIRED") {
        navigate("/verify-otp", { state: { email: formData.email.trim().toLowerCase(), purpose: "signup" } });
        return;
      }
      if (!response.ok) throw new Error(data.message || "We couldn't sign you in.");

      localStorage.setItem("token", data.accessToken);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="GOOD TO HAVE YOU BACK"
      title="Welcome back"
      description="Sign in to pick up right where your thoughts left off."
      footer={<>New to NoteSpace? <Link to="/">Create an account <ArrowRight size={14} /></Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="field-label" htmlFor="email">Email address</label>
        <div className="input-shell">
          <Mail size={17} />
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
        </div>

        <div className="label-row">
          <label className="field-label" htmlFor="password">Password</label>
          <Link className="text-link" to="/forgot-password">Forgot password?</Link>
        </div>
        <div className="input-shell">
          <LockKeyhole size={17} />
          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required value={formData.password} onChange={handleChange} />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Signing you in..." : "Sign in"}
          {!loading && <ArrowRight size={17} />}
        </button>
        <p className="form-footnote">Your notes are waiting exactly where you left them.</p>
      </form>
    </AuthLayout>
  );
};

export default Login;
