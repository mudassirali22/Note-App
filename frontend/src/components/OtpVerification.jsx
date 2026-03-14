import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state;

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (element, index) => {
    const value = element.value;

    if (!/^[0-9]?$/.test(value)) return; // only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  /* ================= BACKSPACE CONTROL ================= */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerify = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_PORT}/user/verify-otp/${email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: otpCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP Verification Failed");
      }

      setMessage("OTP Verified Successfully!");
      setTimeout(() => {
        navigate("/change-password", {state: email});
      }, 2000);

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
            OTP Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleVerify} className="space-y-6">

          {/* OTP INPUTS */}
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            ))}
          </div>

          {/* VERIFY BUTTON */}
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OtpVerification;