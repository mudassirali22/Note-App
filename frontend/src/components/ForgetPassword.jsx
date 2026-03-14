import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_PORT}/user/forget-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(" Verification email sent successfully!");
        navigate('/verify-otp', {state: email})
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-md border border-slate-200">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email to verify your account
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL INPUT */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all
              ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }
            `}
          >
            {loading ? "Verifying..." : "Verify Your Email"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;