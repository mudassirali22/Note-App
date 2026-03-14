import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const email = location.state;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(" Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_PORT}/user/change-password/${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: formData.password,
            confirmPassword: formData.confirmPassword
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed");
      }

      setMessage("Password changed successfully!");

      setTimeout(() => {
        navigate("/login");
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
            Change Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your new password below
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

          {/* NEW PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
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
            {loading ? "Updating..." : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ChangePassword;