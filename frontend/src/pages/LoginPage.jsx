// frontend/src/pages/LoginPage.jsx

import React, { useState, Suspense, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; 
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

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    // Only track mouse on Desktop (>1024px)
    const isDesktop = window.innerWidth > 1024;
    if (!isDesktop) return;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; 
        const rotateY = (x / window.innerWidth) * 15; 
        const rotateX = -(y / window.innerHeight) * 15; 
        logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      if (formRef.current) {
        formRef.current.style.transition = 'none'; 
        formRef.current.style.transform = `translate3d(${x * -0.01}px, ${y * -0.01}px, 0px)`;
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
    // 🔧 LAYOUT FIX: 'min-h-screen' allows scrolling on small split-screens.
    <div className="min-h-screen w-full bg-[#0A0D17] relative flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (3D LOGO) --- */}
      <div className="w-full h-[40vh] lg:h-auto lg:w-[55%] flex flex-col justify-center items-center relative z-10 p-4 shrink-0 lg:min-h-screen">
        <div ref={logoRef} className="flex flex-col items-center justify-center w-full h-full will-change-transform">
          
          {/* 🧠 WATERMARK NUKE (The Crop Technique) 
             1. 'overflow-hidden' on the container acts as the "Frame".
             2. The inner div is 'scale-125' (125% size).
             3. This pushes the bottom-right corner (watermark) outside the frame.
          */}
          <div className="w-full h-full max-h-[300px] lg:max-h-[600px] relative flex items-center justify-center overflow-hidden">
             <div className="w-full h-full scale-[1.25] lg:scale-[1.2] flex items-center justify-center pointer-events-none">
                <Suspense fallback={<div className="text-center text-[#4A4E69] text-sm animate-pulse">Loading 3D Experience...</div>}>
                  <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
                </Suspense>
             </div>
          </div>
          
          {/* Title Text */}
          <div className="text-center mt-[-20px] z-20 relative pointer-events-auto">
            <h1 className="text-3xl lg:text-6xl font-bold text-white tracking-tight">
              QueryStream
            </h1>
            <p className="text-sm lg:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN (LOGIN FORM) --- */}
      {/* 🔧 FIX: 'flex-1' allows it to grow. 'py-8' ensures spacing on small screens. */}
      <div className="w-full flex-1 lg:w-[45%] flex flex-col justify-center items-center relative z-10 p-6 lg:p-12 lg:pl-0 bg-transparent lg:min-h-screen">
        <div ref={formRef} className="w-full max-w-sm lg:max-w-md mx-auto will-change-transform"> 
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm lg:text-lg text-[#94A3B8]">Log in to continue your flow.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field with Proper Label */}
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

            {/* Password Field with Proper Label */}
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