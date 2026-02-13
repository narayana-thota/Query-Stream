// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; 

// --- CUSTOM LOGO COMPONENT (Replaces Spline) ---
const CustomLogo = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
      {/* DEFINITIONS FOR GRADIENTS (3D Effect) */}
      <defs>
        {/* Purple Sphere Gradient */}
        <radialGradient id="sphereGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(140 160) rotate(50) scale(140)">
          <stop stopColor="#9F7AEA" /> {/* Light Purple Highlight */}
          <stop offset="1" stopColor="#5B21B6" /> {/* Dark Purple Shadow */}
        </radialGradient>
        
        {/* Teal Bars Gradient */}
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2DD4BF" /> {/* Teal Highlight */}
          <stop offset="1" stopColor="#0F766E" /> {/* Teal Shadow */}
        </linearGradient>
      </defs>

      {/* 1. THE PURPLE SPHERE */}
      <circle cx="150" cy="200" r="90" fill="url(#sphereGrad)" />

      {/* 2. THE TEAL BEAMS (Angled to match your design) */}
      {/* Top Bar */}
      <rect x="260" y="110" width="160" height="40" rx="20" transform="rotate(15 260 110)" fill="#00E0C7" />
      
      {/* Middle Bar */}
      <rect x="270" y="180" width="160" height="40" rx="20" fill="#00E0C7" />
      
      {/* Bottom Bar */}
      <rect x="260" y="250" width="160" height="40" rx="20" transform="rotate(-15 260 250)" fill="#00E0C7" />
    </svg>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`, 
        { email, password },
        { withCredentials: true } 
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      localStorage.setItem('userEmail', email);

      let nameToSave = response.data.name || response.data.user?.name;
      if (!nameToSave) {
        const namePart = email.split('@')[0];
        nameToSave = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
      localStorage.setItem('userName', nameToSave);

      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.msg || 'Login failed.');
    }
  };

  return (
    // 🔧 LAYOUT: min-h-screen handles content overflow naturally
    <div className="min-h-screen w-full bg-[#0A0D17] relative flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* 🔧 CSS: Hide Scrollbars for cleaner look */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND (Fixed) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (CUSTOM LOGO) --- */}
      {/* Replaced Spline with the new CustomLogo component */}
      <div className="w-full h-[40vh] lg:h-auto lg:w-[55%] flex flex-col justify-center items-center relative z-10 p-4 shrink-0 lg:min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-full">
          
          {/* Logo Container */}
          <div className="w-[280px] h-[280px] lg:w-[500px] lg:h-[500px] relative flex items-center justify-center animate-in fade-in zoom-in duration-700">
             <CustomLogo />
          </div>
          
          {/* Title Text */}
          <div className="text-center mt-[-20px] lg:mt-[-40px] z-20 relative">
            <h1 className="text-3xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-xl">
              QueryStream
            </h1>
            <p className="text-sm lg:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN (LOGIN FORM) --- */}
      <div className="w-full flex-1 lg:h-full lg:w-[45%] flex flex-col justify-center items-center relative z-10 p-6 lg:p-12 lg:pl-0 bg-transparent lg:min-h-screen">
        <div className="w-full max-w-sm lg:max-w-md mx-auto pb-8 lg:pb-0"> 
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm lg:text-lg text-[#94A3B8]">Log in to continue your flow.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="relative group">
              <input 
                type="email" 
                id="email" 
                name="email"
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full py-3 lg:py-4 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                placeholder="Email Address" 
              />
              <label 
                htmlFor="email" 
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 lg:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm"
              >
                Email Address
              </label>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <input 
                type="password" 
                id="password"
                name="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full py-3 lg:py-4 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                placeholder="Password" 
              />
              <label 
                htmlFor="password" 
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 lg:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm"
              >
                Password
              </label>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 lg:py-4 mt-6 bg-[#7F5AF0] hover:bg-[#6f4df7] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-[#7F5AF0]/40 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Login
            </button>

            <p className="text-center text-[#94A3B8] text-sm mt-6">
              Don't have an account? <Link to="/register" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors ml-1">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;