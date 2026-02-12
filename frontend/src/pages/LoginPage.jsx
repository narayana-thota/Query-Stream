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
    // Only track mouse on devices larger than tablets to prevent lag
    const isLargeScreen = window.innerWidth > 1024;
    if (!isLargeScreen) return;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; 
        const rotateY = (x / window.innerWidth) * 20; 
        const rotateX = -(y / window.innerHeight) * 20; 
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
    // 🔧 FIX: h-screen + overflow-hidden prevents scrolling. Flex handles layout.
    <div className="h-screen w-full bg-[#0A0D17] relative overflow-hidden flex flex-col lg:flex-row">
      
      {/* 🔧 CSS HACK: Strictly hide Spline Watermark */}
      <style>{`
        #spline-watermark, .spline-watermark, a[href^="https://spline.design"] {
          display: none !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; width: 0 !important; height: 0 !important;
        }
      `}</style>

      {/* BACKGROUND (Fixed) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (3D LOGO) --- */}
      {/* 🔧 FIX: Flexible height. Takes 40% on mobile, 50% width on Desktop. No negative margins. */}
      <div className="w-full h-[40%] lg:h-full lg:w-1/2 flex flex-col justify-center items-center relative z-10 p-4">
        <div ref={logoRef} className="flex flex-col items-center justify-center w-full h-full">
          {/* 3D Container: Responsive size, max width constraints */}
          <div className="w-full max-w-[300px] aspect-square lg:max-w-[500px] relative">
            <Suspense fallback={<div className="text-center text-[#4A4E69]">Loading 3D...</div>}>
              <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
            </Suspense>
          </div>
          
          {/* Text Container: Standard margins (no negatives) to prevent overlap */}
          <div className="text-center mt-4 z-20">
            <h1 className="text-3xl lg:text-5xl font-bold text-white transition-colors duration-300 hover:text-[#7F5AF0] cursor-default">
              QueryStream
            </h1>
            <p className="text-sm lg:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN (LOGIN FORM) --- */}
      {/* 🔧 FIX: Takes remaining height. Flex center ensures it never goes off screen. */}
      <div className="w-full h-[60%] lg:h-full lg:w-1/2 flex flex-col justify-center items-center relative z-10 p-6 lg:p-12 bg-gradient-to-t from-[#0A0D17] to-transparent lg:bg-none">
        <div ref={formRef} className="w-full max-w-md mx-auto"> 
          <h2 className="text-2xl lg:text-5xl font-bold text-white mb-2 text-center lg:text-left">Welcome Back</h2>
          <p className="text-sm lg:text-xl text-[#94A3B8] mb-6 lg:mb-8 text-center lg:text-left">Log in to continue your flow.</p>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
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
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm"
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
                className="absolute left-0 -top-3.5 text-[#94A3B8] text-xs lg:text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-xs lg:peer-focus:text-sm"
              >
                Password
              </label>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="w-full py-3 lg:py-4 mt-4 bg-[#7F5AF0] hover:bg-[#6f4df7] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-[#7F5AF0]/40 transition-all transform hover:-translate-y-1">
              Login
            </button>

            <p className="text-center text-[#94A3B8] text-sm mt-4 lg:mt-6">
              Don't have an account? <Link to="/register" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;