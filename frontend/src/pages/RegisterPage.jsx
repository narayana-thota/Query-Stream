// frontend/src/pages/RegisterPage.jsx

import React, { useState, Suspense, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; // ✅ IMPORTED CONFIG
import Spline from '@splinetool/react-spline';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- REFS ---
  const logoRef = useRef(null); 
  const formRef = useRef(null); 
  const resetTimer = useRef(null);

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; 
        // 🔧 TWEAK: Reduced rotation intensity for cleaner feel (like Login)
        const rotateY = (x / window.innerWidth) * 30; 
        const rotateX = -(y / window.innerHeight) * 30; 
        logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      if (formRef.current) {
        formRef.current.style.transition = 'none'; 
        formRef.current.style.transform = `translate3d(${x * -0.015}px, ${y * -0.015}px, 0px)`;
      }

      resetTimer.current = setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'; 
          logoRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
        if (formRef.current) {
          formRef.current.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'; 
          formRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      }, 200); 
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. SMART NAME LOGIC (Auto-generate name from email)
    // Example: "narayana@gmail.com" becomes "Narayana"
    let derivedName = "User";
    if (email.includes('@')) {
        const namePart = email.split('@')[0];
        // Remove numbers and capitalize
        const cleanName = namePart.replace(/[0-9]/g, ''); 
        if (cleanName) {
            derivedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        } else {
            // If email is like "12345@gmail.com", keep it as "User" or use the numbers
            derivedName = namePart; 
        }
    }

    try {
      // ✅ Sending the auto-generated 'name' to satisfy the backend
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        { 
            name: derivedName, // Hidden auto-generated name
            email: email, 
            password: password 
        },
        { withCredentials: true }
      );
      
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Registration failed.');
    }
  };

  return (
    // 🔧 LAYOUT FIX: 'overflow-x-hidden' stops side scrolling.
    <div className="w-full min-h-screen bg-[#0A0D17] relative overflow-x-hidden flex flex-col md:flex-row">
      <style>{`
        #spline-watermark, .spline-watermark, a[href^="https://spline.design"] {
          display: none !important; opacity: 0 !important; pointer-events: none !important;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- TOP SECTION (Mobile) / LEFT COLUMN (Desktop) --- */}
      {/* 🔧 FIX: 35vh height on mobile. Stacks perfectly on top. */}
      <div className="w-full h-[35vh] md:w-1/2 md:h-screen flex justify-center items-center relative z-10 pt-4 md:pt-0">
        <div ref={logoRef} className="flex flex-col items-center justify-center will-change-transform scale-75 md:scale-100">
          <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] relative pointer-events-none">
            <Suspense fallback={<div className="text-center text-[#4A4E69]">Loading 3D...</div>}>
              <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
            </Suspense>
          </div>
          <div className="text-center mt-[-30px] md:mt-[-40px] z-20 px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white transition-colors duration-300 hover:text-[#7F5AF0] cursor-default">
              QueryStream
            </h1>
            <p className="text-sm md:text-xl text-[#94A3B8] mt-1 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION (Mobile) / RIGHT COLUMN (Desktop) --- */}
      {/* 🔧 FIX: flex-1 fills remaining space vertically. No overlap. */}
      <div className="w-full flex-1 md:w-1/2 md:h-screen flex flex-col justify-start md:justify-center items-center relative z-10 p-6 md:p-12">
        <div ref={formRef} className="w-full max-w-md mx-auto will-change-transform mt-4 md:mt-0"> 
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center md:text-left">Create Account</h2>
          <p className="text-sm md:text-xl text-[#94A3B8] mb-8 text-center md:text-left">Start your new journey with us.</p>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
            
            {/* Email Field */}
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer"
                id="email"
                placeholder="Email"
              />
              <label htmlFor="email" className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm">
                Email Address
              </label>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password" className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm">
                Password
              </label>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="w-full py-4 mt-6 bg-[#7F5AF0] hover:bg-[#6f4df7] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-[#7F5AF0]/40 transition-all transform hover:-translate-y-1">
              Create Account
            </button>

            <p className="text-center text-[#94A3B8] text-sm mt-8">
              Already have an account? <Link to="/login" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;