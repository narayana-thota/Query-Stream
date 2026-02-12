// frontend/src/pages/LoginPage.jsx

import React, { useState, Suspense, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; // ✅ IMPORTED CONFIG
import Spline from '@splinetool/react-spline';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- REFS ---
  const logoRef = useRef(null); 
  const formRef = useRef(null); 
  const resetTimer = useRef(null);

  // --- ANIMATION LOGIC (OPTIMIZED) ---
  useEffect(() => {
    // 🚀 EXPERT FIX: Only enable heavy mouse tracking on Desktop (>768px).
    // This prevents mobile lag while keeping the 3D logo visible!
    const isDesktop = window.innerWidth > 768;
    if (!isDesktop) return;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; 
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

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // ✅ Uses API_BASE_URL
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
    // 🔧 LAYOUT FIX: 'h-screen' and 'overflow-hidden' strictly prevents scrolling
    <div className="h-screen w-full bg-[#0A0D17] relative overflow-hidden flex flex-col md:flex-row">
      
      {/* 🔧 CSS HACK: Hide Spline Watermark */}
      <style>{`
        #spline-watermark, .spline-watermark, a[href^="https://spline.design"] {
          display: none !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important;
        }
      `}</style>

      {/* BACKGROUND (Fixed) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (3D LOGO) --- */}
      {/* Mobile: 35% height | Desktop: 50% width, Full Height */}
      <div className="w-full h-[35vh] md:w-1/2 md:h-full flex justify-center items-center relative z-10 pt-4 md:pt-0">
        <div ref={logoRef} className="flex flex-col items-center justify-center will-change-transform scale-[0.65] md:scale-100">
          <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] relative pointer-events-none">
            <Suspense fallback={<div className="text-center text-[#4A4E69]">Loading 3D...</div>}>
              <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
            </Suspense>
          </div>
          <div className="text-center mt-[-30px] md:mt-[-40px] z-20 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white transition-colors duration-300 hover:text-[#7F5AF0] cursor-default">
              QueryStream
            </h1>
            <p className="text-lg md:text-xl text-[#94A3B8] mt-1 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN (LOGIN FORM) --- */}
      {/* Mobile: Fills remaining height | Desktop: 50% width, Full Height */}
      <div className="w-full flex-1 md:w-1/2 md:h-full flex flex-col justify-start md:justify-center items-center relative z-10 p-6 md:p-12">
        <div ref={formRef} className="w-full max-w-md mx-auto will-change-transform mt-2 md:mt-0"> 
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 text-center md:text-left">Welcome Back</h2>
          <p className="text-sm md:text-xl text-[#94A3B8] mb-8 text-center md:text-left">Log in to continue your flow.</p>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="relative group">
              <input 
                type="email" 
                id="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                placeholder="Email" 
              />
              <label 
                htmlFor="email" 
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm"
              >
                Email Address
              </label>
            </div>

            <div className="relative group">
              <input 
                type="password" 
                id="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-base outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer" 
                placeholder="Password" 
              />
              <label 
                htmlFor="password" 
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm"
              >
                Password
              </label>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="w-full py-3.5 md:py-4 mt-4 bg-[#7F5AF0] hover:bg-[#6f4df7] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-[#7F5AF0]/40 transition-all transform hover:-translate-y-1">
              Login
            </button>

            <p className="text-center text-[#94A3B8] text-sm mt-6">
              Don't have an account? <Link to="/register" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;