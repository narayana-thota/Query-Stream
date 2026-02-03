// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare, FileText, Plus,
  Trash2, Check, Play, AudioLines, Clock,
  MoreVertical, Flag, Menu, Upload, Loader2, Calendar 
} from 'lucide-react';

const Dashboard = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  
  // --- STATE & DATA ---
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Medium'); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', initials: 'U' });
  const [greeting, setGreeting] = useState('Good Morning');

  const [recentPdfs, setRecentPdfs] = useState([]);
  const [recentPodcasts, setRecentPodcasts] = useState([]);
  const [stats, setStats] = useState({ pendingTasks: 0, totalPdfs: 0, totalPodcasts: 0 });

  // PDF Menu State
  const [openPdfMenu, setOpenPdfMenu] = useState(null); 
  const menuRef = useRef(null);

  // --- NEW: Upload State ---
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenPdfMenu(null);
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

  // --- NEW: Date Formatter ---
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

  // --- NEW: Smart Task Sorting (Date > Priority) ---
  const getSortedTodos = () => {
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    return [...todos].sort((a, b) => {
        // 1. Sort by Date (Newest first)
        // Ensure we have a valid date object for comparison
        const dateA = new Date(a.createdAt || a.date || new Date()); 
        const dateB = new Date(b.createdAt || b.date || new Date());
        
        // Compare values (higher value = newer date)
        if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }

        // 2. If dates are roughly same (e.g. both created "Today"), sort by Priority
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });
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

        // FETCH TODOS
        const todoRes = await axios.get('http://localhost:5000/api/todos', { withCredentials: true });
        // Assign a mock creation date if missing, for sorting demonstration
        const todosWithDates = todoRes.data.map(t => ({
            ...t, 
            createdAt: t.createdAt || t.date || new Date().toISOString() 
        }));
        setTodos(todosWithDates);

        // FETCH PDFS
        const pdfRes = await axios.get('http://localhost:5000/api/pdf', { withCredentials: true });
        const pdfData = Array.isArray(pdfRes.data) ? pdfRes.data : []; 
        // Assign date to PDFs if missing
        const processedPdfs = pdfData.map(p => ({
            ...p, 
            date: p.date || new Date().toISOString()
        }));
        setRecentPdfs(processedPdfs); 

        try {
            const podcastRes = await axios.get('http://localhost:5000/api/podcasts', { withCredentials: true });
            setRecentPodcasts(podcastRes.data.slice(0, 1)); 
            setStats(prev => ({ ...prev, totalPodcasts: podcastRes.data.length }));
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

  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTask.trim()) {
      try {
        const now = new Date().toISOString();
        const res = await axios.post('http://localhost:5000/api/todos', 
          { text: newTask, completed: false, priority: priority, createdAt: now },
          { withCredentials: true } 
        );
        // Add new task with date immediately to UI
        setTodos([...todos, { ...res.data, createdAt: now }]);
        setStats(prev => ({ ...prev, pendingTasks: prev.pendingTasks + 1 }));
        setNewTask(''); setPriority('Medium');
      } catch (error) { console.error(error); }
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`, { withCredentials: true });
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
      await axios.put(`http://localhost:5000/api/todos/${id}`, { completed: !currentStatus }, { withCredentials: true });
    } catch (error) { console.error(error); }
  };

  // --- HANDLE PDF UPLOAD ---
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file); // Matching backend requirement

    try {
        const res = await axios.post('http://localhost:5000/api/pdf/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        });
        
        // Navigate to PDF Manager with the new file data
        navigate('/pdf', { state: { activePdf: res.data } });
    } catch (error) {
        console.error("Upload failed", error);
        navigate('/pdf'); 
    } finally {
        setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleDeletePdf = async (e, id) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      try {
          await axios.delete(`http://localhost:5000/api/pdf/${id}`, { withCredentials: true });
          const newPdfs = recentPdfs.filter(p => (p._id || p.id) !== id);
          setRecentPdfs(newPdfs);
          setStats(prev => ({...prev, totalPdfs: prev.totalPdfs - 1}));
          setOpenPdfMenu(null);
      } catch (error) { console.error("Error deleting PDF", error); }
  };

  const handleOpenPdf = (pdf) => {
      navigate('/pdf', { state: { activePdf: pdf } });
  };

  // --- SUB-COMPONENTS ---
  const RecentPDFsList = () => {
    const HiddenInput = () => (
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePdfUpload} 
            accept="application/pdf" 
            className="hidden" 
        />
    );

    // 🎨 UI/UX FIX: UNIFIED CONTAINER
    // This ensures the box size, glass effect, and border remain constant
    // regardless of whether there are 0 PDFs or 10 PDFs.
    return (
        <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 flex flex-col h-full animate-in fade-in duration-500 relative overflow-hidden group hover:border-[#00E0C7]/50 transition-all duration-300">
            <HiddenInput />
            {/* Constant Green Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00E0C7] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                {/* Header - Always at the top */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText size={20} className="text-[#00E0C7]"/> PDF Manager
                    </h3>
                    {recentPdfs.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button onClick={triggerFileUpload} className="text-[#00E0C7] hover:bg-[#00E0C7]/10 p-1.5 rounded-lg transition-colors" title="Upload New">
                                <Plus size={16} />
                            </button>
                            <Link to="/pdf" className="text-xs font-bold text-[#00E0C7] hover:underline uppercase tracking-wide">View All</Link>
                        </div>
                    )}
                </div>
                
                {/* Content Area - Handles Scroll internally */}
                <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                    {recentPdfs.length === 0 ? (
                        /* Empty State Content */
                        <div className="h-full flex flex-col items-center justify-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-[#94A3B8] border border-white/5 shadow-inner">
                                <FileText size={32} />
                            </div>
                            <p className="text-[#94A3B8] text-sm font-medium">No PDFs uploaded yet.</p>
                            <button 
                                onClick={triggerFileUpload}
                                disabled={isUploading}
                                className="w-full py-3.5 rounded-xl bg-[#00E0C7] text-[#0A0D17] font-bold hover:bg-[#00c4ae] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00E0C7]/20 disabled:opacity-70"
                            >
                                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload New PDF</>}
                            </button>
                        </div>
                    ) : (
                        /* List State Content */
                        <div className="space-y-3">
                            {recentPdfs.map(pdf => (
                                <div key={pdf._id || pdf.id} className="relative group/item">
                                    <div 
                                        onClick={() => handleOpenPdf(pdf)} 
                                        className="flex items-center justify-between p-3 bg-[#0A0D17] border border-white/5 rounded-xl hover:border-[#00E0C7]/30 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-[#00E0C7]/10 flex items-center justify-center text-[#00E0C7] flex-shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate max-w-[120px]">{pdf.filename || pdf.name || 'Untitled'}</h4>
                                                {/* Date Display */}
                                                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] mt-0.5">
                                                    <Clock size={10} /> 
                                                    <span>{formatDate(pdf.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                setOpenPdfMenu(openPdfMenu === (pdf._id || pdf.id) ? null : (pdf._id || pdf.id));
                                            }}
                                            className="p-2 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/5 relative z-20"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    {openPdfMenu === (pdf._id || pdf.id) && (
                                        <div ref={menuRef} className="absolute right-0 top-10 bg-[#1F2937] border border-white/10 rounded-lg shadow-xl z-50 py-1 w-32 animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={(e) => handleDeletePdf(e, pdf._id || pdf.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-[#FF4D4D] hover:bg-white/5 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
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
  };

  const RecentPodcastsList = () => (
    <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AudioLines size={20} className="text-[#7F5AF0]"/> Recent Podcasts
        </h3>
        <Link to="/podcast" className="text-xs font-bold text-[#7F5AF0] hover:underline uppercase tracking-wide">View All</Link>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:hidden">
        {recentPodcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] opacity-60">
            <AudioLines size={48} className="mb-2" />
            <p>No podcasts yet.</p>
          </div>
        ) : (
          recentPodcasts.map(podcast => (
            <div key={podcast._id} className="flex items-center justify-between p-3 bg-[#0A0D17] border border-white/5 rounded-xl group hover:border-[#7F5AF0]/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center text-[#7F5AF0] flex-shrink-0">
                  <Play size={14} fill="currentColor"/>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-white truncate max-w-[120px]">{podcast.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]"><Clock size={10} /> {podcast.duration}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const GeneratePodcastCard = () => (
    <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 relative overflow-hidden group h-full flex flex-col justify-between hover:border-[#7F5AF0]/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#11141D] to-[#1a1f2e]"></div>
      {/* Glow Effect (Purple) */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
            <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center text-[#7F5AF0] shadow-lg shadow-[#7F5AF0]/10">
                <AudioLines size={24} />
            </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Generate Podcast</h3>
            <p className="text-sm text-[#94A3B8] mb-6">Turn your notes into engaging audio content.</p>
        </div>
        
        <Link to="/podcast" className="w-full py-3.5 rounded-xl bg-[#7F5AF0] text-white font-bold hover:bg-[#6941c6] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7F5AF0]/20">
            Start Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
             <button className="md:hidden text-[#94A3B8] hover:text-white p-1" onClick={toggleSidebar}>
                <Menu size={24} />
             </button>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          {/* ⚠️ REMOVED SEARCH BAR AS REQUESTED */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white leading-none">{user.name.replace(/[0-9]/g, '')}</span>
              <span className="text-[11px] text-[#94A3B8] font-medium mt-1">{user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-sm font-bold text-white shadow-lg">{user.initials}</div>
          </div>
        </div>
      </header>

      {/* WELCOME BANNER */}
      <section className="relative w-full rounded-2xl overflow-hidden p-5 md:p-8 shadow-2xl shadow-[#7F5AF0]/10 border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7F5AF0] to-[#00E0C7] opacity-10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{greeting}, {user.name.replace(/[0-9]/g, '').split(' ')[0]}! 👋</h2>
          <p className="text-[#94A3B8] text-xs md:text-lg">Ready to boost your productivity? You have <span className="text-[#00E0C7] font-bold">{stats.pendingTasks} pending tasks</span> today.</p>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
         {/* Box 1: Pending Tasks */}
         <div className="relative overflow-hidden rounded-xl md:rounded-[20px] p-3 md:p-6 bg-[#11141D] border border-white/5 group hover:border-[#7F5AF0]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7F5AF0]/10">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-center justify-between h-full">
                <div className="flex flex-col items-center justify-center w-full md:items-start md:w-auto">
                  <p className="text-[#94A3B8] text-[8px] md:text-xs uppercase tracking-widest mb-1">PENDING TASKS</p>
                  <h3 className={`text-xl md:text-5xl font-black ${stats.pendingTasks > 0 ? 'text-[#7F5AF0]' : 'text-white'}`}>{stats.pendingTasks}</h3>
                </div>
                <div className="flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#1F2937] items-center justify-center text-[#7F5AF0] shrink-0 border border-white/5 shadow-inner transition-all duration-300 group-hover:bg-[#7F5AF0] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(127,90,240,0.6)]">
                    <CheckSquare size={20} className="md:w-6 md:h-6" />
                </div>
            </div>
         </div>
         
         {/* Box 2: PDFs */}
         <div className="relative overflow-hidden rounded-xl md:rounded-[20px] p-3 md:p-6 bg-[#11141D] border border-white/5 group hover:border-[#00E0C7]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00E0C7]/10">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00E0C7] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-center justify-between h-full">
                <div className="flex flex-col items-center justify-center w-full md:items-start md:w-auto">
                  <p className="text-[#94A3B8] text-[8px] md:text-xs uppercase tracking-widest mb-1">PDFS UPLOADED</p>
                  <h3 className={`text-xl md:text-5xl font-black ${stats.totalPdfs > 0 ? 'text-[#00E0C7]' : 'text-white'}`}>{stats.totalPdfs}</h3>
                </div>
                <div className="flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#1F2937] items-center justify-center text-[#00E0C7] shrink-0 border border-white/5 shadow-inner transition-all duration-300 group-hover:bg-[#00E0C7] group-hover:text-[#0A0D17] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,224,199,0.6)]">
                    <FileText size={20} className="md:w-6 md:h-6" />
                </div>
            </div>
         </div>
         
         {/* Box 3: Podcasts */}
         <div className="relative overflow-hidden rounded-xl md:rounded-[20px] p-3 md:p-6 bg-[#11141D] border border-white/5 group hover:border-[#7F5AF0]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7F5AF0]/10">
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#7F5AF0] rounded-full filter blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
             <div className="relative z-10 flex items-center justify-between h-full">
                <div className="flex flex-col items-center justify-center w-full md:items-start md:w-auto">
                  <p className="text-[#94A3B8] text-[8px] md:text-xs uppercase tracking-widest mb-1">PODCASTS</p>
                  <h3 className={`text-xl md:text-5xl font-black ${stats.totalPodcasts > 0 ? 'text-[#7F5AF0]' : 'text-white'}`}>{stats.totalPodcasts}</h3>
                </div>
                <div className="flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#1F2937] items-center justify-center text-[#7F5AF0] shrink-0 border border-white/5 shadow-inner transition-all duration-300 group-hover:bg-[#7F5AF0] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(127,90,240,0.6)]">
                    <AudioLines size={20} className="md:w-6 md:h-6" />
                </div>
             </div>
         </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        
        {/* RECENT TASKS */}
        <div className="lg:col-span-2 bg-[#11141D] rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col min-h-[500px] md:h-[550px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-bold text-white">Recent Tasks</h3>
            <Link to="/todo" className="text-sm text-[#7F5AF0] hover:text-[#00E0C7] font-medium">See All</Link>
          </div>
          
          <div className="relative mb-4 md:mb-6">
            <div className="relative">
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input 
                type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={handleAddTask} 
                placeholder="Add a task..." 
                className="w-full bg-[#0A0D17] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 md:pr-32 text-white focus:outline-none focus:border-[#7F5AF0] transition-all placeholder:text-[#94A3B8]/50 shadow-inner" 
                />
            </div>

            {/* PRIORITY SELECTOR */}
            <div className="mt-3 md:mt-0 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 flex items-center gap-2 md:gap-1 bg-transparent md:bg-[#11141D]/50 md:p-1 rounded-lg justify-start">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider md:hidden mr-1">Priority:</span>
                {[
                    { val: 'Low', color: 'text-blue-400', border: 'border-blue-400/30 bg-blue-400/10' },
                    { val: 'Medium', color: 'text-amber-400', border: 'border-amber-400/30 bg-amber-400/10' },
                    { val: 'High', color: 'text-red-400', border: 'border-red-400/30 bg-red-400/10' }
                ].map((p) => (
                    <button
                        key={p.val} onClick={() => setPriority(p.val)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 md:px-2 md:py-1 rounded-lg md:rounded-md transition-all border ${priority === p.val ? `${p.color} ${p.border} ring-1 ring-white/10` : `text-slate-500 border-transparent hover:bg-white/5`}`}
                    >
                        <Flag size={12} fill={priority === p.val ? "currentColor" : "none"} strokeWidth={2} />
                        <span className="text-[10px] md:hidden lg:inline font-bold uppercase">{p.val}</span>
                    </button>
                ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-1 [&::-webkit-scrollbar]:hidden">
             {/* ⚠️ CHANGED: Mapping over sorted tasks */}
             {getSortedTodos().map((task) => (
                <div key={task._id} className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0A0D17]/50 ${task.completed ? 'opacity-50' : ''}`}>
                   <div className="flex items-center gap-3">
                      <button onClick={() => toggleComplete(task._id, task.completed)} className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-[#00E0C7] border-[#00E0C7]' : 'border-gray-600'}`}>
                         {task.completed && <Check size={12} className="text-black" strokeWidth={4} />}
                      </button>
                      <div className="flex flex-col">
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.text}</span>
                        <div className="flex gap-2 items-center mt-1">
                           <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${getPriorityColor(task.priority || 'Medium')}`}>
                              <Flag size={8} fill="currentColor" /> {task.priority || 'Medium'}
                           </span>
                           {/* ⚠️ ADDED: Date display next to priority */}
                           <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 border-l border-white/10 pl-2">
                              <Calendar size={8} /> {formatDate(task.createdAt || task.date)}
                           </span>
                        </div>
                      </div>
                   </div>
                   <button onClick={() => handleDeleteTask(task._id)} className="text-gray-600 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6 flex flex-col min-h-[500px] md:h-[550px]">
          <div className="flex-1 overflow-hidden">
            <RecentPDFsList /> 
          </div>
          <div className="flex-1 overflow-hidden">
             {stats.totalPodcasts > 0 ? <RecentPodcastsList /> : <GeneratePodcastCard />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;