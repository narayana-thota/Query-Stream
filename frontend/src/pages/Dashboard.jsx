// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config'; 
import {
  CheckSquare, FileText, Plus,
  Trash2, Check, Play, AudioLines, Clock,
  MoreVertical, Flag, Menu, Upload, Loader2, Calendar, Layout
} from 'lucide-react';

const Dashboard = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Medium'); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', initials: 'U' });
  const [greeting, setGreeting] = useState('Good Morning');

  const [recentPdfs, setRecentPdfs] = useState([]);
  const [recentPodcasts, setRecentPodcasts] = useState([]);
  const [stats, setStats] = useState({ pendingTasks: 0, totalPdfs: 0, totalPodcasts: 0 });

  // Menu States
  const [openPdfMenu, setOpenPdfMenu] = useState(null); 
  const [openPodcastMenu, setOpenPodcastMenu] = useState(null); 
  const menuRef = useRef(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenPdfMenu(null);
            setOpenPodcastMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPERS ---
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const cleanName = fullName.replace(/[0-9]/g, ''); 
    const names = cleanName.trim().split(' ');
    if (names.length === 1 && names[0].length > 0) return names[0].charAt(0).toUpperCase();
    if (names.length > 1) return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    return 'U';
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSortedTodos = () => {
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return [...todos].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || new Date()); 
        const dateB = new Date(b.createdAt || b.date || new Date());
        
        if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { 
        headers: { 'x-auth-token': token },
        withCredentials: true 
    };
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setGreeting(getTimeBasedGreeting());
      try {
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        
        setUser({
          name: storedName || 'User',
          email: storedEmail || 'user@example.com',
          initials: getInitials(storedName || 'User')
        });

        const todoRes = await axios.get(`${API_BASE_URL}/api/todos`, getAuthHeader());
        const todosWithDates = todoRes.data.map(t => ({
            ...t, 
            createdAt: t.createdAt || t.date || new Date().toISOString() 
        }));
        setTodos(todosWithDates);

        const pdfRes = await axios.get(`${API_BASE_URL}/api/pdf`, getAuthHeader());
        const pdfData = Array.isArray(pdfRes.data) ? pdfRes.data : []; 
        const processedPdfs = pdfData.map(p => ({
            ...p, 
            date: p.date || p.createdAt || new Date().toISOString() 
        }));
        setRecentPdfs(processedPdfs); 

        try {
            const podcastRes = await axios.get(`${API_BASE_URL}/api/podcast`, getAuthHeader());
            const podcastData = Array.isArray(podcastRes.data) ? podcastRes.data : [];
            const processedPodcasts = podcastData.map(p => ({
                ...p,
                date: p.createdAt || p.date || new Date().toISOString()
            }));
            processedPodcasts.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentPodcasts(processedPodcasts); 
            setStats(prev => ({ ...prev, totalPodcasts: podcastData.length }));
        } catch (e) { console.log("Podcasts API silent fail"); }

        setStats(prev => ({ ...prev, pendingTasks: todoRes.data.filter(t => !t.completed).length, totalPdfs: pdfData.length }));

      } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  // --- ACTIONS ---
  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTask.trim()) {
      try {
        const now = new Date().toISOString();
        const res = await axios.post(`${API_BASE_URL}/api/todos`, 
          { text: newTask, completed: false, priority: priority, createdAt: now },
          getAuthHeader()
        );
        setTodos([...todos, { ...res.data, createdAt: now }]);
        setStats(prev => ({ ...prev, pendingTasks: prev.pendingTasks + 1 }));
        setNewTask(''); setPriority('Medium');
      } catch (error) { console.error(error); }
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`, getAuthHeader());
      const newTodos = todos.filter(task => task._id !== id);
      setTodos(newTodos);
      setStats(prev => ({ ...prev, pendingTasks: newTodos.filter(t => !t.completed).length }));
    } catch (error) { console.error(error); }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const newTodos = todos.map(t => t._id === id ? { ...t, completed: !currentStatus } : t);
      setTodos(newTodos);
      setStats(prev => ({ ...prev, pendingTasks: newTodos.filter(t => !t.completed).length }));
      await axios.put(`${API_BASE_URL}/api/todos/${id}`, { completed: !currentStatus }, getAuthHeader());
    } catch (error) { console.error(error); }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
        const res = await axios.post(`${API_BASE_URL}/api/pdf/upload`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'x-auth-token': localStorage.getItem('token') 
            },
            withCredentials: true
        });
        navigate('/pdf', { state: { activePdf: res.data } });
    } catch (error) {
        console.error("Upload failed", error);
        navigate('/pdf'); 
    } finally { setIsUploading(false); }
  };

  const triggerFileUpload = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const handleDeletePdf = async (e, id) => {
      e.preventDefault(); e.stopPropagation(); 
      try {
          await axios.delete(`${API_BASE_URL}/api/pdf/${id}`, getAuthHeader());
          setRecentPdfs(recentPdfs.filter(p => (p._id || p.id) !== id));
          setStats(prev => ({...prev, totalPdfs: prev.totalPdfs - 1}));
          setOpenPdfMenu(null);
      } catch (error) { console.error("Error deleting PDF", error); }
  };

  const handleDeletePodcast = async (e, id) => {
      e.preventDefault(); e.stopPropagation();
      try {
          await axios.delete(`${API_BASE_URL}/api/podcast/${id}`, getAuthHeader());
          setRecentPodcasts(recentPodcasts.filter(p => (p._id || p.id) !== id));
          setStats(prev => ({...prev, totalPodcasts: prev.totalPodcasts - 1}));
          setOpenPodcastMenu(null);
      } catch (error) { console.error("Error deleting podcast", error); }
  };

  const handleOpenPdf = (pdf) => {
      navigate('/pdf', { state: { activePdf: pdf } });
  };

  // --- SUB-COMPONENTS ---
  const RecentPDFsList = () => (
    <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 flex flex-col h-full animate-in fade-in duration-500 relative overflow-hidden group hover:border-[#00E0C7]/50 transition-all duration-300">
        <input type="file" ref={fileInputRef} onChange={handlePdfUpload} accept="application/pdf" className="hidden" />
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00E0C7] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText size={20} className="text-[#00E0C7]"/> PDF Manager</h3>
                {recentPdfs.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button onClick={triggerFileUpload} className="text-[#00E0C7] hover:bg-[#00E0C7]/10 p-1.5 rounded-lg transition-colors"><Plus size={16} /></button>
                        <Link to="/pdf" className="text-xs font-bold text-[#00E0C7] hover:underline uppercase tracking-wide">View All</Link>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                {recentPdfs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-[#94A3B8] border border-white/5 shadow-inner"><FileText size={32} /></div>
                        <p className="text-[#94A3B8] text-sm font-medium">No PDFs uploaded yet.</p>
                        <button onClick={triggerFileUpload} disabled={isUploading} className="w-full py-3.5 rounded-xl bg-[#00E0C7] text-[#0A0D17] font-bold hover:bg-[#00c4ae] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00E0C7]/20 disabled:opacity-70">
                            {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload New PDF</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentPdfs.map(pdf => (
                            <div key={pdf._id || pdf.id} className="relative group/item">
                                <div onClick={() => handleOpenPdf(pdf)} className="flex items-center justify-between p-3 bg-[#0A0D17] border border-white/5 rounded-xl hover:border-[#00E0C7]/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-[#00E0C7]/10 flex items-center justify-center text-[#00E0C7] flex-shrink-0"><FileText size={20} /></div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate max-w-[120px]">{pdf.filename || pdf.name || 'Untitled'}</h4>
                                            <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] mt-0.5"><Clock size={10} /> <span>{formatDate(pdf.date)}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setOpenPdfMenu(openPdfMenu === (pdf._id || pdf.id) ? null : (pdf._id || pdf.id)); }} className="p-2 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/5 relative z-20"><MoreVertical size={16} /></button>
                                </div>
                                {openPdfMenu === (pdf._id || pdf.id) && (
                                    <div ref={menuRef} className="absolute right-0 top-10 bg-[#1F2937] border border-white/10 rounded-lg shadow-xl z-50 py-1 w-32 animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={(e) => handleDeletePdf(e, pdf._id || pdf.id)} className="w-full text-left px-4 py-2 text-sm text-[#FF4D4D] hover:bg-white/5 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const RecentPodcastsList = () => (
    <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 flex flex-col h-full animate-in fade-in duration-500 relative overflow-hidden group hover:border-[#7F5AF0]/50 transition-all duration-300">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><AudioLines size={20} className="text-[#7F5AF0]"/> Recent Podcasts</h3>
            {recentPodcasts.length > 0 && (
                <div className="flex items-center gap-2">
                    <Link to="/podcast" className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10 p-1.5 rounded-lg transition-colors"><Plus size={16} /></Link>
                    <Link to="/podcast" className="text-xs font-bold text-[#7F5AF0] hover:underline uppercase tracking-wide">View All</Link>
                </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:hidden">
            {recentPodcasts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-[#94A3B8] border border-white/5 shadow-inner"><AudioLines size={32} /></div>
                <div className="text-center"><p className="text-[#94A3B8] text-sm font-medium">No podcasts yet.</p><p className="text-[#94A3B8]/60 text-xs mt-1">Turn notes into audio.</p></div>
                <Link to="/podcast" className="w-full py-3.5 rounded-xl bg-[#7F5AF0] text-white font-bold hover:bg-[#6941c6] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7F5AF0]/20"><AudioLines size={18} /> Start Generating</Link>
              </div>
            ) : (
              recentPodcasts.map(podcast => (
                <div key={podcast._id || podcast.id} className="relative group/item">
                    <div onClick={() => navigate('/podcast')} className="flex items-center justify-between p-3 bg-[#0A0D17] border border-white/5 rounded-xl hover:border-[#7F5AF0]/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-[#7F5AF0]/10 flex items-center justify-center text-[#7F5AF0] flex-shrink-0"><Play size={14} fill="currentColor"/></div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-medium text-white truncate max-w-[120px]">{podcast.name || "Podcast"}</h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] mt-0.5"><Clock size={10} /> <span>{formatDate(podcast.date)}</span></div>
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setOpenPodcastMenu(openPodcastMenu === (podcast._id || podcast.id) ? null : (podcast._id || podcast.id)); }} className="p-2 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/5 relative z-20"><MoreVertical size={16} /></button>
                    </div>
                    {openPodcastMenu === (podcast._id || podcast.id) && (
                        <div ref={menuRef} className="absolute right-0 top-10 bg-[#1F2937] border border-white/10 rounded-lg shadow-xl z-50 py-1 w-32 animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={(e) => handleDeletePodcast(e, podcast._id || podcast.id)} className="w-full text-left px-4 py-2 text-sm text-[#FF4D4D] hover:bg-white/5 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                        </div>
                    )}
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );

  return (
    // 🔧 FIX: overflow-x-hidden, reduced bottom padding (pb-6), consistent gaps
    <div className="h-screen w-full bg-[#0A0D17] text-[#F9FAFB] font-sans selection:bg-[#7F5AF0]/30 flex flex-col overflow-hidden">
      
      {/* HEADER: Fixed (Sticky) */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-[#0A0D17] flex-shrink-0 border-b border-gray-800 z-50">
        <div className="flex items-center gap-3">
             <button className="md:hidden text-[#94A3B8] hover:text-white p-1" onClick={toggleSidebar}><Menu size={24} /></button>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              {/* Hide email on mobile */}
              <span className="text-sm font-bold text-white leading-none truncate max-w-[100px] md:max-w-none">{user.name.replace(/[0-9]/g, '')}</span>
              <span className="text-[11px] text-[#94A3B8] font-medium mt-1 hidden sm:block">{user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">{user.initials}</div>
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto page-scroll">
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-6 md:pb-8">
            <section className="relative w-full rounded-2xl overflow-hidden p-5 md:p-8 shadow-2xl shadow-[#7F5AF0]/10 border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0] to-[#00E0C7] opacity-10"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
                <div className="relative z-10">
                <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{greeting}, {user.name.replace(/[0-9]/g, '').split(' ')[0]}! 👋</h2>
                <p className="text-[#94A3B8] text-xs md:text-lg">Ready to boost your productivity? You have <span className="text-[#00E0C7] font-bold">{stats.pendingTasks} pending tasks</span> today.</p>
                </div>
            </section>

            {/* 🔧 FIX: Stats Grid - 3 cols on Mobile (Same Row), Reverted to "Previous" Design */}
            <div className="grid grid-cols-3 gap-2 md:gap-6">
                {/* PENDING CARD */}
                <div className="bg-[#11141D] border border-white/5 p-2 md:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
                    <p className="text-[#94A3B8] text-[9px] md:text-xs uppercase tracking-widest font-bold">PENDING</p>
                    <h3 className={`text-xl md:text-4xl font-black ${stats.pendingTasks > 0 ? 'text-[#7F5AF0]' : 'text-white'}`}>{stats.pendingTasks}</h3>
                    <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#7F5AF0]">
                        <CheckSquare size={16} className="md:w-6 md:h-6" />
                    </div>
                </div>

                {/* PDFS CARD */}
                <div className="bg-[#11141D] border border-white/5 p-2 md:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
                    <p className="text-[#94A3B8] text-[9px] md:text-xs uppercase tracking-widest font-bold">PDFS</p>
                    <h3 className={`text-xl md:text-4xl font-black ${stats.totalPdfs > 0 ? 'text-[#00E0C7]' : 'text-white'}`}>{stats.totalPdfs}</h3>
                    <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#00E0C7]">
                        <FileText size={16} className="md:w-6 md:h-6" />
                    </div>
                </div>

                {/* PODCASTS CARD */}
                <div className="bg-[#11141D] border border-white/5 p-2 md:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
                    <p className="text-[#94A3B8] text-[9px] md:text-xs uppercase tracking-widest font-bold">PODCASTS</p>
                    <h3 className={`text-xl md:text-4xl font-black ${stats.totalPodcasts > 0 ? 'text-[#7F5AF0]' : 'text-white'}`}>{stats.totalPodcasts}</h3>
                    <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#7F5AF0]">
                        <AudioLines size={16} className="md:w-6 md:h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                <div className="lg:col-span-2 bg-[#11141D] rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col min-h-[500px] md:h-[550px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-white">Recent Tasks</h3>
                    <Link to="/todo" className="text-sm text-[#7F5AF0] hover:text-[#00E0C7] font-medium">See All</Link>
                </div>
                
                {/* 🔧 FIX: Priority Focus Box */}
                <div className="relative mb-4 md:mb-6">
                    <div className="relative mb-3">
                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={handleAddTask} placeholder="Add a task..." className="w-full bg-[#0A0D17] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#7F5AF0] transition-all placeholder:text-[#94A3B8]/50 shadow-inner" />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider hidden md:block mr-1">Priority:</span>
                        {[ { val: 'Low', color: 'text-blue-400', border: 'border-blue-400/30 bg-blue-400/10' }, { val: 'Medium', color: 'text-amber-400', border: 'border-amber-400/30 bg-amber-400/10' }, { val: 'High', color: 'text-red-400', border: 'border-red-400/30 bg-red-400/10' } ].map((p) => (
                            <button key={p.val} onClick={() => setPriority(p.val)} className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-2 py-2 md:px-3 rounded-lg md:rounded-md transition-all border outline-none ${priority === p.val ? `${p.color} ${p.border} ring-1 ring-white/10` : `text-slate-500 border-transparent hover:bg-white/5`}`}>
                                <Flag size={12} fill={priority === p.val ? "currentColor" : "none"} strokeWidth={2} />
                                <span className="text-[10px] font-bold uppercase">{p.val}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-1 [&::-webkit-scrollbar]:hidden">
                    {todos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                            <Layout size={40} className="mb-2" />
                            <p className="text-sm">No recent tasks found.</p>
                        </div>
                    ) : (
                        getSortedTodos().map((task) => (
                            <div key={task._id} className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0A0D17]/50 ${task.completed ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleComplete(task._id, task.completed)} className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-[#00E0C7] border-[#00E0C7]' : 'border-gray-600'}`}>{task.completed && <Check size={12} className="text-black" strokeWidth={4} />}</button>
                                <div className="flex flex-col">
                                    <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.text}</span>
                                    <div className="flex gap-2 items-center mt-1">
                                    <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${getPriorityColor(task.priority || 'Medium')}`}><Flag size={8} fill="currentColor" /> {task.priority || 'Medium'}</span>
                                    <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 border-l border-white/10 pl-2"><Calendar size={8} /> {formatDate(task.createdAt || task.date)}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteTask(task._id)} className="text-gray-600 hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        ))
                    )}
                </div>
                </div>

                <div className="lg:col-span-1 space-y-6 flex flex-col min-h-[500px] md:h-[550px]">
                <div className="flex-1 overflow-hidden"><RecentPDFsList /></div>
                <div className="flex-1 overflow-hidden"><RecentPodcastsList /></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;