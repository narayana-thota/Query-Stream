import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Mic, Play, Pause, RotateCcw, RotateCw, Download,
  FileText, Settings2, Menu, ChevronDown,
  CheckCircle2, Loader, AlertCircle, Upload, X, Sparkles
} from 'lucide-react';

// --- SUB-COMPONENT: CUSTOM AUDIO PLAYER ---
const AudioPlayer = ({ audioUrl, duration }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Store bar heights so they don't change on re-render
  const [barHeights] = useState(() => 
    Array.from({ length: 45 }, () => Math.max(20, Math.random() * 100))
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration || 120);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = (currentTime / (totalDuration || 1)) * 100;

  return (
    <div className="bg-[#0A0D17] rounded-2xl border border-white/10 p-6 flex flex-col gap-6 relative overflow-hidden group shadow-inner">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Visualizer Bars */}
      <div className="h-24 w-full flex items-end justify-center gap-1 opacity-80 px-4">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-t-sm transition-all duration-300 ${
              isPlaying ? 'bg-[#00E0C7]' : 'bg-[#00E0C7]/50'
            }`}
            style={{
              height: `${height}%`,
              animation: isPlaying ? `pulse-audio ${1 + Math.random() * 0.5}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.05}s`,
              animationPlayState: isPlaying ? 'running' : 'paused'
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 px-2">
        <div className="relative w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-[#00E0C7] transition-all duration-100 shadow-[0_0_10px_#00E0C7]"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={totalDuration}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = e.target.value;
                setCurrentTime(Number(e.target.value));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-[#94A3B8]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 pb-2">
        <button
          onClick={() => skip(-10)}
          className="text-[#94A3B8] hover:text-white transition-all hover:scale-110 p-2"
        >
          <RotateCcw size={24} />
        </button>
        
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[#7F5AF0] flex items-center justify-center text-white shadow-[0_0_20px_rgba(127,90,240,0.4)] hover:shadow-[0_0_30px_rgba(127,90,240,0.6)] hover:scale-105 transition-all"
        >
          {isPlaying ? (
            <Pause size={28} fill="currentColor" />
          ) : (
            <Play size={28} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button
          onClick={() => skip(10)}
          className="text-[#94A3B8] hover:text-white transition-all hover:scale-110 p-2"
        >
          <RotateCw size={24} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT: PODCAST GEN
// ==========================================
const PodcastGenPage = ({ toggleSidebar }) => {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('Neerja');
  const [tone, setTone] = useState('Indian Style');
  const [length, setLength] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Safe User Init
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    initials: 'U'
  });
  
  const [generatedData, setGeneratedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentPodcastId, setCurrentPodcastId] = useState(null); // Track the podcast ID
  const fileInputRef = useRef(null);

  // Load Data
  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName') || 'User';
      const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || 'user@example.com';
      
      let displayName = storedName;
      
      // If name is default, contains @, or numbers, try to clean it or use email
      if (storedName === 'User' || storedName.includes('@') || /\d/.test(storedName)) {
        if (storedName === 'User' || storedName.includes('@')) {
             let tempName = storedEmail.split('@')[0];
             displayName = tempName;
        }
      }

      // 🔧 FIX: Strictly remove any numbers from the name (e.g. narayana23 -> narayana)
      displayName = displayName.replace(/[0-9]/g, '');

      // Capitalize first letter
      if (displayName) {
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      const initials = displayName.charAt(0).toUpperCase();

      setUser({
        name: displayName,
        email: storedEmail,
        initials: initials
      });

      const savedData = sessionStorage.getItem('podcastSession');
      if (savedData) {
        setGeneratedData(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Storage load error:", e);
    }
  }, []);

  // Save Session
  useEffect(() => {
    if (generatedData) {
      try {
        sessionStorage.setItem('podcastSession', JSON.stringify(generatedData));
      } catch (e) {
        console.error("Session save error:", e);
      }
    }
  }, [generatedData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setErrorMsg(null);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleRemoveFile = async (e) => {
    e.stopPropagation();
    
    // If a podcast was generated from this file, delete it from MongoDB
    if (currentPodcastId) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const config = {
          headers: {},
          withCredentials: true
        };
        if (token) config.headers['x-auth-token'] = token;

        await axios.delete(`http://localhost:5000/api/podcast/${currentPodcastId}`, config);
        console.log(`🗑️ Deleted podcast from database: ${currentPodcastId}`);
        
        // Clear the generated data
        setGeneratedData(null);
        setCurrentPodcastId(null);
        try { sessionStorage.removeItem('podcastSession'); } catch (e) {}
        
      } catch (error) {
        console.error("Delete failed:", error);
        // Continue with file removal even if delete fails
      }
    }
    
    // Clear the file selection
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!textInput.trim() && !selectedFile) {
      alert("Please enter text or upload a PDF.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedData(null);
    setErrorMsg(null);
    
    try { sessionStorage.removeItem('podcastSession'); } catch (e) {}

    try {
      const formData = new FormData();
      formData.append('text', textInput);
      formData.append('voice', selectedVoice);
      formData.append('tone', tone);
      formData.append('length', length > 75 ? 'Long' : length > 35 ? 'Medium' : 'Short');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      };
      if (token) config.headers['x-auth-token'] = token;

      const response = await axios.post('http://localhost:5000/api/podcast/generate', formData, config);

      setGeneratedData({
        audioUrl: response.data.audioUrl,
        transcript: response.data.transcript
      });
      
      // Store the podcast ID if it was saved to database
      if (response.data.podcastId) {
        setCurrentPodcastId(response.data.podcastId);
        console.log(`📌 Podcast saved with ID: ${response.data.podcastId}`);
      }
    } catch (error) {
      console.error("Generation Failed:", error);
      if (error.response) {
          if (error.response.status === 401) {
              setErrorMsg("Session expired. Please login again.");
          } else {
              setErrorMsg(error.response.data.msg || "Server Error. Please try again.");
          }
      } else if (error.request) {
          setErrorMsg("Cannot connect to server (Port 5000). Is backend running?");
      } else {
          setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMp3 = () => {
    if (!generatedData?.audioUrl) return;
    const link = document.createElement("a");
    link.href = generatedData.audioUrl;
    link.download = `QueryStream_Podcast_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportScript = () => {
    if (!generatedData?.transcript) return;
    const element = document.createElement("a");
    const file = new Blob([generatedData.transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `QueryStream_Script_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getLengthLabel = (val) => {
    if (val < 35) return 'Short (<2m)';
    if (val < 75) return 'Medium (2-5m)';
    return 'Long (5m+)';
  };

  // 🔧 FIX: Changed to h-screen, flex-col, overflow-hidden to fix Header
  return (
    <div className="h-screen w-full bg-[#0A0D17] text-[#F9FAFB] font-sans selection:bg-[#7F5AF0]/30 flex flex-col overflow-hidden">
      
      {/* HEADER - Added border-b border-gray-800 to match PDF Manager */}
      <header className="flex items-center justify-between px-8 py-6 flex-shrink-0 bg-[#0A0D17] z-10 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-[#94A3B8] hover:text-white p-1"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          {/* Custom Brand Logo */}
          <div className="w-12 h-12 rounded-xl bg-[#7F5AF0]/10 flex items-center justify-center border border-[#7F5AF0]/20 shadow-lg shadow-[#7F5AF0]/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="10" width="2" height="4" rx="1" fill="#7F5AF0" fillOpacity="0.5"/>
                  <rect x="7" y="6" width="2" height="12" rx="1" fill="#7F5AF0" fillOpacity="0.8"/>
                  <rect x="11" y="3" width="2" height="18" rx="1" fill="#7F5AF0"/>
                  <rect x="15" y="6" width="2" height="12" rx="1" fill="#7F5AF0" fillOpacity="0.8"/>
                  <rect x="19" y="10" width="2" height="4" rx="1" fill="#7F5AF0" fillOpacity="0.5"/>
              </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">
            Podcast Generator
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium mt-1 max-w-[150px] truncate">
                {user.email}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-lg font-bold text-white shadow-lg border border-white/10">
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT - Wrapped in flex-1 overflow-y-auto to allow scrolling independently of header */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Source Content */}
              <div className="bg-[#11141D] border border-white/5 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                  <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#7F5AF0]">
                    <FileText size={18} />
                  </div>
                  <h3>Source Content</h3>
                </div>
                
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste text, notes, or type a topic..."
                  className="w-full h-40 bg-[#0A0D17] border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#7F5AF0] focus:ring-1 focus:ring-[#7F5AF0] resize-none transition-all custom-scrollbar"
                />

                <div
                  className={`mt-4 border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-[#00E0C7]/50 bg-[#00E0C7]/5'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-2 bg-[#00E0C7]/20 rounded-lg text-[#00E0C7]">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm text-white truncate max-w-[180px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove file and delete from database"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Upload size={16} />
                      <span>Upload PDF (Optional)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="bg-[#11141D] border border-white/5 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                  <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#00E0C7]">
                    <Mic size={18} />
                  </div>
                  <h3>Select Voice</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Neerja', type: 'Indian Female' },
                    { id: 'Prabhat', type: 'Indian Male' },
                    { id: 'Atlas', type: 'US Professional' },
                    { id: 'Luna', type: 'US Storyteller' }
                  ].map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        selectedVoice === voice.id
                          ? 'bg-[#7F5AF0]/10 border-2 border-[#7F5AF0] shadow-[0_0_15px_rgba(127,90,240,0.2)]'
                          : 'bg-[#0A0D17] border border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold ${
                          selectedVoice === voice.id ? 'text-white' : 'text-gray-400'
                        }`}>
                          {voice.id}
                        </span>
                        {selectedVoice === voice.id && (
                          <CheckCircle2 size={16} className="text-[#00E0C7]" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{voice.type}</span>
                        <button
                          className={`p-1.5 rounded-full transition-colors ${
                              selectedVoice === voice.id
                              ? 'bg-[#7F5AF0] text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                          title="Play Sample"
                        >
                          <Play size={10} fill="currentColor"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-[#11141D] border border-white/5 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                  <div className="p-2 bg-[#0A0D17] rounded-lg border border-white/10 text-[#7F5AF0]">
                    <Settings2 size={18} />
                  </div>
                  <h3>Configuration</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Tone Style
                    </label>
                    <div className="relative">
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full bg-[#0A0D17] border border-white/10 text-white text-sm rounded-xl px-4 py-3 appearance-none focus:border-[#7F5AF0] focus:outline-none cursor-pointer hover:border-white/20 transition-colors"
                      >
                        <option>Indian Style</option>
                        <option>Informative</option>
                        <option>Humorous</option>
                        <option>Formal</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Duration
                      </label>
                      <span className="text-xs text-[#00E0C7] font-bold bg-[#00E0C7]/10 px-2 py-1 rounded border border-[#00E0C7]/20">
                        {getLengthLabel(length)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-2 bg-[#0A0D17] rounded-lg appearance-none cursor-pointer accent-[#7F5AF0]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`mt-8 w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg text-white shadow-xl transition-all ${
                    isGenerating
                      ? 'bg-[#1F2937] cursor-not-allowed opacity-70'
                      : 'bg-[#7F5AF0] hover:bg-[#6941c6] shadow-[#7F5AF0]/20 hover:shadow-[#7F5AF0]/40 hover:-translate-y-1 active:translate-y-0'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="animate-pulse"/>
                      Generate Podcast
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: RESULTS */}
            <div className="lg:col-span-7 flex flex-col h-full bg-[#11141D] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px]">
              
              {/* Empty State */}
              {!isGenerating && !generatedData && !errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-40 h-40 rounded-full bg-[#0A0D17] border border-[#7F5AF0]/20 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(127,90,240,0.15)] relative">
                    <Mic size={64} className="text-[#7F5AF0]"/>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Your masterpiece awaits</h2>
                  <p className="text-[#94A3B8] max-w-md text-lg leading-relaxed">
                    Configure your settings on the left and hit generate to create a professional AI-powered audio experience.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#11141D] z-20">
                  <div className="flex gap-2 mb-8 items-end h-20">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div
                        key={i}
                        className="w-4 bg-[#00E0C7] rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          height: '40%',
                          animationDuration: '1.2s'
                        }}
                      />
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold text-white animate-pulse">Generating Audio...</h2>
                  <div className="flex flex-col items-center mt-4 gap-2">
                    <span className="text-[#94A3B8] text-sm flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#00E0C7]"/>
                      Writing {tone} script
                    </span>
                    <span className="text-[#94A3B8] text-sm flex items-center gap-2 animate-pulse">
                      <Loader size={14} className="text-[#7F5AF0] animate-spin"/>
                      Synthesizing voice
                    </span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {errorMsg && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-[#11141D]/90 backdrop-blur">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle size={48} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
                  <p className="text-red-400 mb-6 max-w-md bg-red-950/20 p-4 rounded-xl border border-red-500/10">
                    {errorMsg}
                  </p>
                  <button
                    onClick={() => setErrorMsg(null)}
                    className="px-6 py-3 bg-[#1F2937] hover:bg-[#374151] rounded-xl text-white font-medium transition-colors border border-white/5 flex items-center gap-2"
                  >
                    <RotateCcw size={16} /> Try Again
                  </button>
                </div>
              )}

              {/* Result State - FIXED SCRIPT CONTAINER */}
              {generatedData && !isGenerating && !errorMsg && (
                <div className="flex flex-col h-full p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Your Generated Podcast</h2>
                      <div className="flex items-center gap-2 text-sm text-[#00E0C7] font-medium bg-[#00E0C7]/10 w-fit px-3 py-1 rounded-full border border-[#00E0C7]/20">
                        <CheckCircle2 size={14} />
                        <span>Ready to play</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleExportScript}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors font-medium text-sm group"
                        title="Export Script"
                      >
                        <FileText size={16} className="group-hover:text-[#7F5AF0] transition-colors"/>
                        Script
                      </button>
                      <button
                        onClick={handleDownloadMp3}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors font-medium text-sm group"
                        title="Download MP3"
                      >
                        <Download size={16} className="group-hover:text-[#00E0C7] transition-colors"/>
                        MP3
                      </button>
                      {currentPodcastId && (
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                              const config = {
                                headers: {},
                                withCredentials: true
                              };
                              if (token) config.headers['x-auth-token'] = token;

                              await axios.delete(`http://localhost:5000/api/podcast/${currentPodcastId}`, config);
                              
                              // Clear the UI
                              setGeneratedData(null);
                              setCurrentPodcastId(null);
                              setSelectedFile(null);
                              try { sessionStorage.removeItem('podcastSession'); } catch (e) {}
                              
                              console.log('🗑️ Podcast deleted successfully');
                            } catch (error) {
                              console.error("Delete failed:", error);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500/10 transition-colors font-medium text-sm group"
                          title="Delete Podcast"
                        >
                          <X size={16} className="group-hover:text-red-500 transition-colors"/>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <AudioPlayer audioUrl={generatedData.audioUrl} duration={120} />
                  </div>

                  {/* 🔧 FIXED: Script Box - Maximum Height with Scroll */}
                  <div className="flex-1 min-h-0 bg-[#0A0D17] border border-white/5 rounded-2xl overflow-hidden flex flex-col max-h-[520px]">
                    <div className="p-4 border-b border-white/5 bg-[#0A0D17] flex items-center gap-2 flex-shrink-0">
                      <FileText size={16} className="text-gray-500"/>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        AI Generated Script
                      </h3>
                    </div>
                    
                    {/* 🔧 FIXED: Set max-h-[520px] to prevent over-expansion while allowing scroll */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <p className="text-[#94A3B8] leading-8 text-lg font-light whitespace-pre-line">
                        {generatedData.transcript}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Dark Theme Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
        
        @keyframes pulse-audio {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PodcastGenPage;