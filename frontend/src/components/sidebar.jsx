// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, CheckSquare, FileText, Mic, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: 'User', initials: 'U' });

  // --- USER DATA LOADING ---
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const displayName = storedName || 'User';
    
    let initials = 'U';
    if (displayName) {
        const cleanName = displayName.replace(/[0-9]/g, '').trim(); 
        const names = cleanName.split(' ');
        if (names.length === 1 && names[0].length > 0) initials = names[0].charAt(0).toUpperCase();
        else if (names.length > 1) initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    setUser({ name: displayName, initials });
  }, []);

  // --- MOBILE UX: Close on route change ---
  useEffect(() => {
    // Only close if we are on mobile (screen width < 768px)
    const handleResize = () => {
        if (window.innerWidth < 768 && isOpen && onClose) {
            onClose();
        }
    };
    
    // Close sidebar immediately when route changes on mobile
    if (window.innerWidth < 768 && onClose) {
        onClose();
    }

    // Optional: Add listener to handle resizing window from desktop to mobile
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]); // Depend on location change

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ⚠️ MOBILE OVERLAY (Backdrop) - Only visible when isOpen is true on Mobile */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      ></div>

      {/* ⚠️ SIDEBAR CONTAINER */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 
          w-64 h-screen bg-[#0A0D17] border-r border-white/5 
          flex flex-col flex-shrink-0 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
          {/* LOGO AREA */}
          <div className="px-6 pt-8 pb-2 flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
                <svg className="w-10 h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 50 50" fill="none">
                  <circle cx="10" cy="25" r="8" fill="#7F5AF0" />
                  <path d="M 22 18 Q 35 20 45 22" stroke="#00E0C7" strokeWidth="2.5" fill="none" />
                  <path d="M 22 25 Q 40 25 45 25" stroke="#00E0C7" strokeWidth="2.5" fill="none" />
                  <path d="M 22 32 Q 35 30 45 28" stroke="#00E0C7" strokeWidth="2.5" fill="none" />
                </svg>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">QueryStream</h1>
            </div>
            
            {/* Close Button (Mobile Only) */}
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white p-2">
                <X size={24} />
            </button>
          </div>
          
          <div className="px-8 mb-6">
            <p className="text-[10px] font-semibold text-gray-500 tracking-wide pl-1 uppercase">From Query to Stream</p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-[#7F5AF0] text-white shadow-lg shadow-[#7F5AF0]/20' : 'text-[#94A3B8] hover:bg-[#1F2937]/50 hover:text-white'}`}>
              <LayoutGrid size={20} /><span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/todo" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/todo') ? 'bg-[#7F5AF0] text-white shadow-lg shadow-[#7F5AF0]/20' : 'text-[#94A3B8] hover:bg-[#1F2937]/50 hover:text-white'}`}>
              <CheckSquare size={20} /><span className="font-medium">To-Do List</span>
            </Link>
            <Link to="/pdf" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/pdf') ? 'bg-[#7F5AF0] text-white shadow-lg shadow-[#7F5AF0]/20' : 'text-[#94A3B8] hover:bg-[#1F2937]/50 hover:text-white'}`}>
              <FileText size={20} /><span className="font-medium">PDF Manager</span>
            </Link>
            <Link to="/podcast" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/podcast') ? 'bg-[#7F5AF0] text-white shadow-lg shadow-[#7F5AF0]/20' : 'text-[#94A3B8] hover:bg-[#1F2937]/50 hover:text-white'}`}>
              <Mic size={20} /><span className="font-medium">Podcast Gen</span>
            </Link>
          </nav>

          {/* USER PROFILE */}
          <div className="p-4 border-t border-white/5 bg-[#0A0D17]">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#11141D] hover:bg-[#1a1f2e] transition-colors group border border-transparent hover:border-[#7F5AF0]/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-xs font-bold shadow-inner text-white shrink-0">{user.initials}</div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-[#94A3B8]">User</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-[#94A3B8] hover:text-[#FF4D4D] transition-colors p-1.5 rounded-lg" title="Logout"><LogOut size={16} /></button>
            </div>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;