import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

const ProfessionalSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_PORT}/user/signup`,
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
      throw new Error(data.message || "Something went wrong");
    }

    console.log("Server Response:", data);
    alert("Signup Successful ");
    navigate('/login');
     
  } catch (error) {
    console.error("Signup Error:", error.message);
    alert(error.message);
  }
};




  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        
        {/* Logo/Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join our professional workspace today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-0.5">Username</label>
            <input
              type="text"
              name="userName"
              required
              value={formData.userName}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400"
              placeholder="e.g. alex_dev"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-0.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400"
              placeholder="alex@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-0.5">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all shadow-md shadow-indigo-100 active:scale-[0.99]"
          >
            Get Started
          </button>
        </form>

      <div className="mt-8 text-center">
         <p className="text-slate-500 text-sm">
           Already have an account?{" "}
           <Link
             to="/login"
             className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
           >
             Sign in
           </Link>
         </p>
       </div>
      </div>
    </div>
  );
};

export default ProfessionalSignup;