// frontend/src/pages/PDFManagerPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  FileText, Upload, Send, Bot, User, Loader, 
  CheckCircle2, AlertCircle, Sparkles, MessageSquare, Menu
} from 'lucide-react';

const PDFManagerPage = ({ toggleSidebar }) => {
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, ready, analyzing, complete, error
  const [summary, setSummary] = useState('');
  const [pdfId, setPdfId] = useState(null); 
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: 'Upload a document to generate a summary and start chatting!' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Data from Dashboard
  const location = useLocation();
  const [dashboardPdfData, setDashboardPdfData] = useState(null);

  // User Info
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', initials: 'U' });

  const chatEndRef = useRef(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    // Prevent auto-scroll on mount
    window.scrollTo(0, 0);
    
    // Load User
    const storedName = localStorage.getItem('userName') || 'User';
    const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || 'user@example.com';
    
    // Clean the name - remove numbers and clean up
    let displayName = storedName;
    
    // If name contains numbers or @ symbol, extract from email
    if (storedName === 'User' || storedName.includes('@') || /\d/.test(storedName)) {
      let tempName = storedEmail.split('@')[0];
      tempName = tempName.replace(/[0-9]/g, ''); // Remove numbers
      if (tempName) {
        displayName = tempName.charAt(0).toUpperCase() + tempName.slice(1);
      }
    }
    
    // Generate initials from the clean name
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    setUser({ name: displayName, email: storedEmail, initials });

    // ⚠️ Check for PDF passed from Dashboard
    if (location.state && location.state.activePdf) {
        const { activePdf } = location.state;
        
        // Store the data but DO NOT analyze yet
        setDashboardPdfData(activePdf);
        
        // Mock a file object so the UI shows the name
        setFile({ name: activePdf.filename || activePdf.originalName || 'Document.pdf' });
        
        // Set ID
        setPdfId(activePdf._id || activePdf.id);
        
        // Set status to READY (Waiting for user to click Analyze)
        setStatus('ready');
    }
  }, [location]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]); 

  // --- 2. FILE HANDLERS ---
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setStatus('ready');
      setSummary(''); 
      setPdfId(null);
      setDashboardPdfData(null); // Clear dashboard data if user picks new file
      setChatHistory([{ role: 'ai', content: 'Document ready. Click "Analyze Document" to begin.' }]);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleAnalyze = async () => {
    if (!file && !pdfId) return;

    setStatus('analyzing');

    // ⚠️ SCENARIO A: FROM DASHBOARD (Already uploaded)
    if (dashboardPdfData && pdfId) {
        // Simulate "Processing" delay for better UX
        setTimeout(() => {
            setSummary(dashboardPdfData.summary || "Summary not available.");
            setStatus('complete');
            setChatHistory(prev => [...prev, { role: 'ai', content: `Loaded "${file.name}". You can now chat with it.` }]);
        }, 800);
        return;
    }

    // ⚠️ SCENARIO B: NEW UPLOAD
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await axios.post('http://localhost:5000/api/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });

      const { summary: returnedSummary, _id } = res.data;
      
      setSummary(returnedSummary);
      setPdfId(_id); 
      setStatus('complete');
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Analysis complete. Ask me anything about the document.' }]);

    } catch (error) {
      console.error("Upload failed:", error);
      setStatus('error');
      if (error.response && error.response.status === 429) {
          alert("Groq API is busy. Please wait a moment and try again.");
      }
    }
  };

  // --- 3. CHAT HANDLER ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !pdfId) return; 

    const userMsg = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await axios.post('http://localhost:5000/api/pdf/chat', {
        pdfId: pdfId,
        question: userMsg
      }, {
        withCredentials: true
      });

      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: res.data.answer || "I couldn't generate an answer."
      }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I encountered an error connecting to the AI."
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const getStatusColor = () => {
    switch(status) {
      case 'ready': return 'text-[#7F5AF0] border-[#7F5AF0]';
      case 'analyzing': return 'text-[#00E0C7] border-[#00E0C7]';
      case 'complete': return 'text-[#00E0C7] border-[#00E0C7]';
      case 'error': return 'text-red-500 border-red-500';
      default: return 'text-gray-500 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0D17] text-[#F9FAFB] font-sans selection:bg-[#7F5AF0]/30">
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .chat-scroll::-webkit-scrollbar,
        .summary-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track,
        .summary-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb,
        .summary-scroll::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover,
        .summary-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}</style>
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-[#0A0D17] sticky top-0 z-50 border-b border-gray-800">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          {toggleSidebar && (
            <button
              className="md:hidden text-[#94A3B8] hover:text-white p-2 -ml-2"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          )}
          
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#7F5AF0]/10 flex items-center justify-center border border-[#7F5AF0]/20 shadow-lg shadow-[#7F5AF0]/5">
              <FileText size={22} className="text-[#7F5AF0] md:w-[26px] md:h-[26px]" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">
            PDF Manager
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-gray-800">
            <div className="text-right">
              <p className="text-xs md:text-sm font-bold text-white leading-tight">{user.name}</p>
              <p className="text-[9px] md:text-xs text-gray-500 break-all">{user.email}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg ring-2 ring-[#0A0D17]">
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-4 md:gap-6">
          
          {/* TOP ROW: UPLOADER + SUMMARY (Same Size - Fixed Height) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            
            {/* LEFT: UPLOADER (1/2 width, reduced height) */}
            <div>
              <div className="bg-[#11141D] border border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl flex flex-col h-[380px] md:h-[420px]">
                <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2 flex-shrink-0">
                  <Upload size={18} className="text-[#7F5AF0] md:w-5 md:h-5" /> Document Uploader
                </h2>
                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4 flex-shrink-0">Upload PDFs to extract insights instantly.</p>

                {/* Upload Box */}
                <div className={`
                  h-40 md:h-48 w-full border-2 border-dashed rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-3 md:p-4 text-center transition-all duration-300 relative group flex-shrink-0
                  ${status === 'analyzing' ? 'border-[#00E0C7] bg-[#00E0C7]/5' : 'border-[#7F5AF0]/30 hover:border-[#7F5AF0] hover:bg-[#7F5AF0]/5'}
                `}>
                  <input 
                    type="file" accept=".pdf" onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={status === 'analyzing'}
                  />
                  
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1F2937] flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    {status === 'analyzing' ? (
                      <Loader size={24} className="text-[#00E0C7] animate-spin md:w-7 md:h-7" />
                    ) : (
                      <FileText size={24} className={`${file || pdfId ? "text-[#7F5AF0]" : "text-gray-500"} md:w-7 md:h-7`} />
                    )}
                  </div>
                  
                  <h3 className="text-sm md:text-base font-bold text-white mb-1 truncate max-w-full px-2 md:px-4">
                    {file ? file.name : "Drop PDF here"}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    {file ? "Ready to Analyze" : "or click to browse"}
                  </p>
                </div>

                {/* STATUS & BUTTON */}
                <div className="mt-3 md:mt-4 flex-shrink-0">
                   <div className={`flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg md:rounded-xl border mb-2 md:mb-3 bg-[#0A0D17] ${getStatusColor()}`}>
                      {status === 'analyzing' && <Loader size={14} className="animate-spin md:w-4 md:h-4" />}
                      {(status === 'complete' || status === 'ready') && <CheckCircle2 size={14} className="md:w-4 md:h-4" />}
                      {status === 'error' && <AlertCircle size={14} className="md:w-4 md:h-4" />}
                      <span className="text-[10px] md:text-xs font-medium capitalize">
                        {status === 'idle' ? 'Waiting for file...' : status}
                      </span>
                   </div>

                   <button 
                     onClick={handleAnalyze}
                     disabled={(!file && !pdfId) || status === 'analyzing'}
                     className={`
                       w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base text-white flex items-center justify-center gap-2 transition-all shadow-lg
                       ${(!file && !pdfId) || status === 'analyzing'
                         ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                         : 'bg-[#7F5AF0] hover:bg-[#6941c6] shadow-[#7F5AF0]/20 hover:shadow-[#7F5AF0]/40'
                       }
                     `}
                   >
                     {status === 'analyzing' ? 'Processing...' : 'Analyze Document'}
                     {status !== 'analyzing' && <Sparkles size={14} className="md:w-4 md:h-4" />}
                   </button>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY (1/2 width, same height as Uploader) */}
            <div>
              <div className="bg-[#11141D] border border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl flex flex-col relative overflow-hidden h-[380px] md:h-[420px]">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E0C7] to-[#7F5AF0] opacity-50"></div>
                 <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 flex-shrink-0">
                   <FileText size={18} className="text-[#00E0C7] md:w-5 md:h-5" /> Executive Summary
                 </h2>
                 
                 {/* Summary Content with custom scrollbar */}
                 <div className="flex-1 overflow-y-auto pr-2 bg-[#0A0D17]/50 rounded-xl p-3 md:p-4 border border-gray-800/50 min-h-0 summary-scroll" style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#334155 transparent'
                 }}>
                   {summary ? (
                     <div className="prose prose-invert prose-sm max-w-none">
                       <p className="text-gray-300 leading-relaxed whitespace-pre-line text-xs md:text-base font-light">
                         {summary}
                       </p>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                       <Bot size={40} className="mb-3 md:w-12 md:h-12" />
                       <p className="text-xs md:text-sm text-center px-4">Upload and analyze a document to see the summary here.</p>
                     </div>
                   )}
                 </div>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: CHAT (Full Width - Dynamic Height) */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="bg-[#11141D] border border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl flex flex-col">
              <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 flex-shrink-0">
                 <MessageSquare size={18} className="text-[#7F5AF0] md:w-5 md:h-5" /> Q&A Chat
              </h2>

              {/* Chat Messages - Dynamic Height with max constraint */}
              <div className="overflow-y-auto pr-2 space-y-3 md:space-y-4 mb-3 md:mb-4 chat-scroll max-h-[300px] md:max-h-[400px]" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#334155 transparent'
              }}>
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#00E0C7]/10 flex items-center justify-center text-[#00E0C7] flex-shrink-0 mt-1"><Bot size={14} className="md:w-4 md:h-4" /></div>}
                    <div className={`max-w-[85%] md:max-w-[80%] p-2.5 md:p-3 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#7F5AF0] text-white rounded-tr-sm' : 'bg-[#1F2937] text-gray-200 rounded-tl-sm border border-gray-700'}`}>{msg.content}</div>
                    {msg.role === 'user' && <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#7F5AF0]/10 flex items-center justify-center text-[#7F5AF0] flex-shrink-0 mt-1"><User size={14} className="md:w-4 md:h-4" /></div>}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-2 md:gap-3 justify-start">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#00E0C7]/10 flex items-center justify-center text-[#00E0C7] flex-shrink-0 mt-1"><Bot size={14} className="md:w-4 md:h-4" /></div>
                    <div className="bg-[#1F2937] text-gray-400 p-2.5 md:p-3 rounded-xl md:rounded-2xl rounded-tl-sm border border-gray-700 text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="relative flex-shrink-0">
                <input 
                  type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  placeholder={status === 'complete' ? "Ask a question..." : "Waiting for analysis..."}
                  disabled={status !== 'complete' || isChatLoading}
                  className="w-full bg-[#0A0D17] border border-gray-800 rounded-lg md:rounded-xl py-3 md:py-4 pl-4 md:pl-5 pr-12 md:pr-14 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#7F5AF0] focus:ring-1 focus:ring-[#7F5AF0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button type="submit" disabled={!chatInput.trim() || status !== 'complete' || isChatLoading} className="absolute right-1.5 md:right-2 top-1.5 md:top-2 p-2 bg-[#7F5AF0] hover:bg-[#6941c6] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PDFManagerPage;