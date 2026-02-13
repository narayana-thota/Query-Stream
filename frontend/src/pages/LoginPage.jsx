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

  // --- ANIMATION LOGIC (Performance Optimized) ---
  useEffect(() => {
    // Only track mouse on Desktop (>1024px) to prevent mobile lag/battery drain
    const isDesktop = window.innerWidth > 1024;
    if (!isDesktop) return;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; 
        // Subtle rotation
        const rotateY = (x / window.innerWidth) * 15; 
        const rotateX = -(y / window.innerHeight) * 15; 
        logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      if (formRef.current) {
        formRef.current.style.transition = 'none'; 
        // Subtle parallax translation
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
    // 🔧 LAYOUT FIX: 'h-[100dvh]' handles mobile browser bars.
    // 'overflow-hidden' on parent, specific overflow on children to prevent body scrollbar.
    <div className="h-[100dvh] w-full bg-[#0A0D17] relative flex flex-col lg:flex-row overflow-hidden">
      
      {/* 🔧 CSS: Hide Scrollbars & Force Watermark Hidden */}
      <style>{`
        /* Hide Scrollbar for Chrome/Safari/Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide Scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* BACKGROUND (Fixed) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (3D LOGO) --- */}
      {/* 🔧 FIX: Mobile: 40% height. Desktop: 55% width. Flex shrink 0 prevents collapse. */}
      <div className="w-full h-[40vh] lg:h-full lg:w-[55%] flex flex-col justify-center items-center relative z-10 p-4 shrink-0">
        <div ref={logoRef} className="flex flex-col items-center justify-center w-full h-full will-change-transform">
          
          {/* 🧠 WATERMARK NUKE: The "Crop & Zoom" Technique 
             1. Parent: 'overflow-hidden' creates a frame.
             2. Child: 'scale-[1.2]' zooms in by 20%.
             3. Result: The watermark at the edge is pushed OUTSIDE the frame and clipped.
          */}
          <div className="w-full h-full max-h-[300px] lg:max-h-[600px] relative flex items-center justify-center overflow-hidden">
             <div className="w-full h-full scale-[1.25] flex items-center justify-center">
                <Suspense fallback={<div className="text-center text-[#4A4E69] text-sm animate-pulse">Loading 3D Experience...</div>}>
                  <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
                </Suspense>
             </div>
          </div>
          
          {/* Title Text - Positioned relatively to stack below the 3D scene cleanly */}
          <div className="text-center mt-[-10px] lg:mt-[-20px] z-20 relative pointer-events-auto">
            <h1 className="text-3xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
              QueryStream
            </h1>
            <p className="text-sm lg:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN (LOGIN FORM) --- */}
      {/* 🔧 FIX: 'overflow-y-auto' allows this section to scroll independently if content overflows (split screen) */}
      <div className="w-full flex-1 lg:h-full lg:w-[45%] flex flex-col justify-center items-center relative z-10 p-6 lg:p-12 lg:pl-0 bg-transparent overflow-y-auto no-scrollbar">
        <div ref={formRef} className="w-full max-w-sm lg:max-w-md mx-auto will-change-transform pb-8 lg:pb-0"> 
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm lg:text-lg text-[#94A3B8]">Log in to continue your flow.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="relative group">
              <input 
                type="email" 
                id="email" 
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

            <div className="relative group">
              <input 
                type="password" 
                id="password" 
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