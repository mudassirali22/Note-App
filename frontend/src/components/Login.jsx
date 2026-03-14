import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      console.log("Login Data:", formData);

      const response = await fetch(
        `${import.meta.env.VITE_PORT}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login Failed");
      }

      console.log("Server Response:", data);
      localStorage.setItem("token", data.accessToken);

      alert("Login Successful!");


      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans antialiased">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">


        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Please enter your details to sign in.
          </p>
        </div>


        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <Link
  to="/forgot-password"
  className="text-xs font-semibold text-indigo-600 hover:underline"
>
  Forgot password?
</Link>
            </div>

            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-md 
              ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>


        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;