// frontend/src/pages/TodoListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, Search, Bell, Plus, Trash2, CheckCircle2, 
  Circle, ListTodo, Clock, TrendingUp, Calendar, Flag, 
  Loader, ChevronDown, Menu
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const StatsCard = ({ icon, label, value }) => (
  <div className="bg-[#11141D] p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center gap-5">
    <div className="p-3 bg-[#0A0D17] rounded-xl border border-gray-800 text-[#7F5AF0]">{icon}</div>
    <div>
      <h3 className="text-3xl font-bold text-white leading-none mb-1">{value}</h3>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

const FilterButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`
      px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-[#7F5AF0] text-white shadow-md' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
      }
    `}
  >
    {label}
  </button>
);

// ✨ CLEAN TASK ITEM (Solid Background, Specific Colors) ✨
const TaskItem = ({ todo, toggleComplete, handleDelete }) => {
  
  // 1. Priority Colors (Badge & Flag)
  const getPriorityStyle = (p) => {
    switch(p) {
      case 'High': return { 
        badge: 'text-red-500 bg-red-500/10 border-red-500/20', 
        icon: 'text-red-500' 
      };
      case 'Medium': return { 
        badge: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', 
        icon: 'text-yellow-500' 
      };
      case 'Low': return { 
        badge: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', 
        icon: 'text-emerald-500' 
      };
      default: return { 
        badge: 'text-gray-400 bg-gray-500/10 border-gray-500/20', 
        icon: 'text-gray-400' 
      };
    }
  };

  const styles = getPriorityStyle(todo.priority);

  return (
    <div className={`
      group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
      ${todo.completed 
        ? 'bg-[#0A0D17] border-gray-800 opacity-50' 
        : 'bg-[#0A0D17] border-gray-800 hover:border-[#7F5AF0] hover:shadow-md'
      }
    `}>
        {/* Custom Checkbox */}
        <button 
          onClick={() => toggleComplete(todo._id, todo.completed)} 
          className={`
            relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${todo.completed 
              ? 'bg-[#7F5AF0] border-[#7F5AF0]' 
              : 'border-gray-600 hover:border-[#7F5AF0] bg-transparent'
            }
          `}
        >
            {todo.completed && <CheckCircle2 size={16} className="text-white" strokeWidth={3} />}
        </button>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2">
            {/* Text */}
            <span className={`
              text-base font-medium flex-1 truncate
              ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-200'}
            `}>
                {todo.text}
            </span>
            
            {/* Meta Info (Badges) */}
            <div className="flex items-center gap-3">
                {/* Priority Badge */}
                <div className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${styles.badge}
                `}>
                    <Flag size={12} className={styles.icon} fill="currentColor" />
                    {todo.priority || 'Medium'}
                </div>

                {/* Date Badge (Beautified: Soft Blue/Indigo) */}
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#818cf8] bg-[#818cf8]/10 px-2.5 py-1 rounded-md border border-[#818cf8]/20">
                    <Calendar size={12} />
                    <span>{new Date(todo.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        </div>

        {/* Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(todo._id);
          }} 
          className="
            opacity-0 group-hover:opacity-100 transition-opacity duration-200 
            p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-500
          "
        >
            <Trash2 size={18} />
        </button>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const TodoListPage = ({ toggleSidebar }) => { 
  const navigate = useNavigate();
  
  // --- STATE ---
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('Medium'); 
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true); 
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', initials: 'U' });

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      // Load User Info
      const storedName = localStorage.getItem('userName') || 'User';
      const storedEmail = localStorage.getItem('userEmail') || 'user@example.com';
      
      let displayName = storedName;
      
      // 🔧 FIX 1: Strictly remove numbers (e.g. narayana23 -> narayana)
      displayName = displayName.replace(/[0-9]/g, '');
      
      // Capitalize first letter
      if (displayName) {
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

      setUser({ name: displayName, email: storedEmail, initials });
      
      try {
          setLoading(true);
          // ✅ URL UPDATED FOR DEPLOYMENT
          const response = await axios.get('https://query-stream.onrender.com/api/todos', { withCredentials: true });
          setTodos(response.data);
      } catch (error) {
          console.error("Error fetching tasks:", error);
          if (error.response && error.response.status === 401) {
             navigate('/login'); 
          }
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, [navigate]); 

  // --- ADD TASK ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    // Payload
    const data = { 
        text: newTask, 
        priority: newPriority, // Checks the state (High/Medium/Low)
    };
    
    try {
        // ✅ URL UPDATED FOR DEPLOYMENT
        const res = await axios.post('https://query-stream.onrender.com/api/todos', data, { withCredentials: true });
        
        // Add new task to state immediately
        setTodos(prevTodos => [res.data, ...prevTodos]);
        
        // Reset Inputs
        setNewTask('');
        setNewPriority('Medium'); // Reset priority back to default
    } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Make sure your backend model includes 'priority'.");
    }
  };

  // --- ACTIONS ---
  const toggleComplete = async (id, currentStatus) => {
    setTodos(todos.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
    try {
        // ✅ URL UPDATED FOR DEPLOYMENT
        await axios.put(`https://query-stream.onrender.com/api/todos/${id}`, 
          { completed: !currentStatus }, 
          { withCredentials: true }
        );
    } catch (error) {
        console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (id) => {
    const originalTodos = todos;
    setTodos(todos.filter(t => t._id !== id));
    try {
        // ✅ URL UPDATED FOR DEPLOYMENT
        await axios.delete(`https://query-stream.onrender.com/api/todos/${id}`, { withCredentials: true });
    } catch (error) {
        setTodos(originalTodos); 
    }
  };

  const clearCompleted = async () => {
    // UI Only clear for now
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;
    setTodos(todos.filter(t => !t.completed));
  }

  // --- SORTING & GROUPING LOGIC ---
  const getGroupedAndSortedTodos = () => {
    // 1. Filter first
    let filtered = todos.filter(todo => {
      if (filter === 'active') return !todo.completed; 
      if (filter === 'completed') return todo.completed;
      return true;
    });

    // 2. Define Priority Weights for sorting
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

    // 3. Sort entire list by Date first (Newest first)
    // Note: If you want Oldest first (like a schedule), swap a and b in the date sort
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Group by Date String
    const groups = {};
    
    filtered.forEach(todo => {
      const dateObj = new Date(todo.date || Date.now());
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dateKey = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // Smart Labels
      if (dateObj.toDateString() === today.toDateString()) dateKey = "Today";
      else if (dateObj.toDateString() === tomorrow.toDateString()) dateKey = "Tomorrow";

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(todo);
    });

    // 5. Sort INSIDE each group by Priority (High -> Medium -> Low)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        // If completion status matches, sort by priority
        if (a.completed === b.completed) {
           return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        }
        // Always show uncompleted first
        return a.completed ? 1 : -1;
      });
    });

    return groups; // Returns object { "Today": [...], "Dec 18": [...] }
  };

  const groupedTodos = getGroupedAndSortedTodos();
  const sortedDates = Object.keys(groupedTodos); // Array of date keys

  // Stats
  const totalTasks = todos.length;
  const remainingTasks = todos.filter(t => !t.completed).length;
  const completedCount = totalTasks - remainingTasks;
  const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  
  return (
    <div className="min-h-screen w-full bg-[#0A0D17] text-[#F9FAFB] font-sans selection:bg-[#7F5AF0]/30">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-6 bg-[#0A0D17] sticky top-0 z-50 border-b border-gray-800">
        <div className="flex items-center gap-4">
          
          {/* 🔧 FIX: Added Sidebar Menu Button */}
          <button
            className="md:hidden text-[#94A3B8] hover:text-white p-1"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#7F5AF0]/10 flex items-center justify-center border border-[#7F5AF0]/20 shadow-lg shadow-[#7F5AF0]/5">
              <CheckSquare size={26} className="text-[#7F5AF0]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">
            To-Do List
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
            {/* 🔧 FIX 2: Details Visible on Mobile (removed hidden md:block) */}
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F5AF0] to-[#00E0C7] flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-[#0A0D17]">
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8 mt-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard icon={<ListTodo size={24} />} label="Total Tasks" value={totalTasks} />
            <StatsCard icon={<Clock size={24} className="text-yellow-500" />} label="Remaining" value={remainingTasks} />
            <StatsCard icon={<CheckSquare size={24} className="text-[#00E0C7]" />} label="Completed" value={completedCount} />
            <StatsCard icon={<TrendingUp size={24} />} label="Progress" value={`${progress}%`} />
          </div>

          {/* Task Manager Card */}
          <div className="bg-[#11141D] border border-gray-800 rounded-3xl p-4 md:p-8 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7F5AF0] via-[#00E0C7] to-[#7F5AF0] opacity-60"></div>

            {/* 🔧 FIX 3: Horizontal Layout for Add Task on Mobile (flex gap-3) */}
            <form onSubmit={handleAddTask} className="relative mb-8 mt-2 flex gap-3">
              
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full h-14 bg-[#0A0D17] border border-gray-800 rounded-xl px-5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#7F5AF0] focus:ring-1 focus:ring-[#7F5AF0] transition-all min-w-0"
                />
              </div>
              
              {/* PRIORITY SELECTOR */}
              <div className="relative w-28 md:w-48 group flex-shrink-0">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full h-14 bg-[#0A0D17] border border-gray-800 rounded-xl pl-3 pr-2 md:pl-5 md:pr-10 text-sm md:text-base text-gray-300 focus:outline-none focus:border-[#7F5AF0] appearance-none cursor-pointer hover:border-gray-600 transition-colors text-center md:text-left"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <Flag size={14} />
                </div>
              </div>

              <button 
                type="submit" 
                className="h-14 w-14 md:w-auto md:px-8 bg-[#7F5AF0] hover:bg-[#6941c6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#7F5AF0]/20 transition-all active:scale-95 group flex-shrink-0"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden md:block ml-2 font-medium">Add</span>
              </button>
            </form>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-800/50 pb-6">
              <div className="flex bg-[#0A0D17] p-1.5 rounded-xl border border-gray-800 w-full sm:w-auto overflow-x-auto">
                <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterButton label="Active" active={filter === 'active'} onClick={() => setFilter('active')} />
                <FilterButton label="Done" active={filter === 'completed'} onClick={() => setFilter('completed')} />
              </div>
              {completedCount > 0 && (
                <button onClick={clearCompleted} className="text-gray-400 hover:text-red-400 text-sm font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={16} /> <span className="hidden sm:inline">Clear Completed</span>
                </button>
              )}
            </div>

            {/* GROUPED LIST */}
            <div className="flex-1 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-500 opacity-60">
                    <Loader size={32} className="animate-spin text-[#7F5AF0]" />
                    <p className="ml-3">Loading tasks...</p>
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 opacity-60">
                    <div className="w-20 h-20 bg-[#1F2937]/50 rounded-full flex items-center justify-center mb-4"><ListTodo size={40} /></div>
                    <p className="text-lg font-medium">No tasks found.</p>
                </div>
              ) : (
                sortedDates.map(dateKey => (
                  <div key={dateKey} className="animate-in fade-in duration-500">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3 pl-1">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{dateKey}</h3>
                      <div className="h-px bg-gray-800 flex-1"></div>
                    </div>

                    {/* Tasks for this date */}
                    <div className="space-y-3">
                      {groupedTodos[dateKey].map(todo => (
                        <TaskItem 
                          key={todo._id} 
                          todo={todo} 
                          toggleComplete={toggleComplete} 
                          handleDelete={handleDelete} 
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;