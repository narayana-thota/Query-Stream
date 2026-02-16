// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; 

// --- CUSTOM LOGO COMPONENT (EXACT COPY FROM LOGIN PAGE) ---
const CustomLogo = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="sphereGrad" x1="0.2" y1="0.2" x2="0.8" y2="0.8">
          <stop offset="0%" stopColor="#8B5CF6" />   
          <stop offset="100%" stopColor="#5B21B6" /> 
        </linearGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2DD4BF" />   
          <stop offset="100%" stopColor="#0F766E" /> 
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g filter="url(#softGlow)">
        <circle cx="200" cy="250" r="110" fill="url(#sphereGrad)" />
        <rect x="310" y="225" width="210" height="50" rx="25" fill="url(#beamGrad)" />
        <rect x="310" y="115" width="210" height="50" rx="25" transform="rotate(16 310 115)" fill="url(#beamGrad)" />
        <rect x="310" y="335" width="210" height="50" rx="25" transform="rotate(-16 310 385)" fill="url(#beamGrad)" />
      </g>
    </svg>
  );
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- SMART NAME LOGIC ---
    // Automatically derive a Name from the email (e.g., john@gmail.com -> John)
    // This keeps the UI clean (only Email & Password) to match the Login Page perfectly.
    let derivedName = "User";
    if (email.includes('@')) {
        const namePart = email.split('@')[0];
        const cleanName = namePart.replace(/[0-9]/g, ''); 
        if (cleanName) {
            derivedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        } else {
            derivedName = namePart; 
        }
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        { 
            name: derivedName, 
            email: email, 
            password: password 
        },
        { withCredentials: true }
      );
      
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.msg || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0D17] relative flex justify-center items-center overflow-x-hidden overflow-y-auto no-scrollbar py-10 lg:py-0">
      
      <style>{`
        /* 1. SCROLLBAR HIDE (Universal) */
        ::-webkit-scrollbar { width: 0px !important; display: none !important; background: transparent; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }

        /* 2. AUTOFILL BACKGROUND FIX */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #0A0D17 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 600000s ease-in-out 0s !important;
        }

        /* 3. AUTOFILL LABEL FIX */
        input:-webkit-autofill + label {
            top: -0.875rem !important; /* Matches -top-3.5 */
            font-size: 0.75rem !important; /* Matches text-xs */
            color: #7F5AF0 !important; /* Matches peer-focus color */
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- MAIN CONTAINER --- */}
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center relative z-10 gap-8 lg:gap-0">

        {/* --- LEFT COLUMN (LOGO) --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4">
          <div className="w-[280px] h-[280px] lg:w-[500px] lg:h-[400px] relative flex items-center justify-center animate-in fade-in zoom-in duration-700">
             <CustomLogo />
          </div>
          
          <div className="text-center mt-[-30px] lg:mt-[-50px] z-20 relative">
            <h1 className="text-3xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-xl">
              QueryStream
            </h1>
            <p className="text-sm lg:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>

        {/* --- RIGHT COLUMN (REGISTER FORM) --- */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-6 lg:p-12">
          <div className="w-full max-w-sm lg:max-w-md lg:translate-x-16"> 
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-sm lg:text-lg text-[#94A3B8]">Start your new journey with us.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="relative group">
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full py-3 lg:py-4 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                  placeholder=" " 
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 lg:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm z-10 pointer-events-none"
                >
                  Email Address
                </label>
              </div>

              <div className="relative group">
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full py-3 lg:py-4 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                  placeholder=" " 
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 lg:peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm z-10 pointer-events-none"
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
                Sign Up
              </button>

              <p className="text-center text-[#94A3B8] text-sm mt-6">
                Already have an account? <Link to="/login" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors ml-1">Log In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;