// frontend/src/pages/RegisterPage.jsx

import React, { useState, Suspense, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- REFS FOR DIRECT DOM MANIPULATION (Zero Lag Physics) ---
  const logoRef = useRef(null); 
  const formRef = useRef(null); 
  const resetTimer = useRef(null);

  // --- MOUSE TRACKING LOGIC (Identical to Login Page) ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      // 1. Get Mouse Position relative to center
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;

      // 2. Kill existing timer (User is moving!)
      if (resetTimer.current) clearTimeout(resetTimer.current);

      // --- A. LOGO: 3D ROTATION ---
      if (logoRef.current) {
        logoRef.current.style.transition = 'none'; // Instant tracking
        // High Tilt (75 degrees)
        const rotateY = (x / window.innerWidth) * 75; 
        const rotateX = -(y / window.innerHeight) * 75;

        logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      // --- B. FORM: 2D MOVEMENT ---
      if (formRef.current) {
        formRef.current.style.transition = 'none'; 
        formRef.current.style.transform = `translate3d(${x * -0.015}px, ${y * -0.015}px, 0px)`;
      }

      // --- C. AUTO-RESET TIMER ---
      resetTimer.current = setTimeout(() => {
        // Reset Logo
        if (logoRef.current) {
          logoRef.current.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
          logoRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
        // Reset Form
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Note: Make sure your backend endpoint is correct
      const response = await axios.post('http://localhost:5000/api/auth/register', { email, password });
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0D17] relative overflow-x-hidden flex flex-col md:flex-row">
      
      {/* --- HIDE SPLINE BADGE --- */}
      <style>{`
        #spline-watermark, .spline-watermark, a[href^="https://spline.design"] {
          display: none !important; opacity: 0 !important; pointer-events: none !important;
        }
      `}</style>

      {/* --- FIXED BACKGROUND LAYER --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#7F5AF0] rounded-full filter blur-[150px] opacity-20 animate-blob-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00E0C7] rounded-full filter blur-[150px] opacity-20 animate-blob-slow [animation-delay:-7s]"></div>
      </div>

      {/* --- LEFT COLUMN (Logo) --- */}
      <div className="flex w-full md:w-1/2 min-h-[300px] md:h-auto md:min-h-screen justify-center items-center relative z-10 pt-10 pb-0 md:py-0">
        
        {/* 3D ROTATION CONTAINER */}
        <div 
          ref={logoRef} 
          className="flex flex-col items-center justify-center will-change-transform"
        >
          {/* 3D Scene */}
          <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] relative pointer-events-none">
            <Suspense fallback={<div className="text-center text-[#4A4E69]">Loading 3D...</div>}>
              <Spline scene="https://prod.spline.design/0rhIHPz8KM935PuI/scene.splinecode" />
            </Suspense>
          </div>

          {/* Text */}
          <div className="text-center mt-[-10px] md:mt-[-40px] z-20 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white transition-colors duration-300 hover:text-[#7F5AF0] cursor-default">
              QueryStream
            </h1>
            <p className="text-lg md:text-xl text-[#94A3B8] mt-2 font-light">
              From Query to Stream.
            </p>
          </div>
        </div>

      </div>

      {/* --- RIGHT COLUMN (Register Form) --- */}
      <div className="flex w-full md:w-1/2 min-h-[500px] md:h-auto md:min-h-screen flex-col justify-center items-center relative z-10 p-6 pt-0 md:p-12 md:pl-48">
        
        {/* 2D SLIDE CONTAINER */}
        <div 
          ref={formRef}
          className="w-full max-w-md mx-auto mt-8 md:mt-16 will-change-transform" 
        > 
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Account
          </h2>
          <p className="text-lg md:text-xl text-[#94A3B8] mb-8 md:mb-12">
            Start your new journey with us.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
            
            {/* Email Field */}
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-lg outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer"
                id="email"
                placeholder="Email"
              />
              <label htmlFor="email" className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm">
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
                className="w-full py-3 bg-transparent border-b-2 border-[#2D3748] text-white text-lg outline-none focus:border-[#7F5AF0] transition-colors placeholder-transparent peer"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password" className="absolute left-0 -top-3.5 text-[#94A3B8] text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-[#94A3B8] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#7F5AF0] peer-focus:text-sm">
                Password
              </label>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 mt-6 bg-[#7F5AF0] hover:bg-[#6f4df7] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-[#7F5AF0]/40 transition-all transform hover:-translate-y-1"
            >
              Create Account
            </button>

            {/* Login Link */}
            <p className="text-center text-[#94A3B8] text-sm mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00E0C7] font-medium hover:text-[#33ffea] transition-colors">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;