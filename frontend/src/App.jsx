import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import OtpVerification from "./components/OtpVerification";
import ChangePassword from "./components/ChangePassword";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;