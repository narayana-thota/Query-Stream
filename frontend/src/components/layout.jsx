// frontend/src/components/Layout.jsx (or wherever your Layout file is)
import React, { useState } from 'react';
import Sidebar from './sidebar'; // Ensure this matches your filename case

const Layout = ({ children }) => {
  // 1. Manage Sidebar State Here
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Function to toggle state (passed to Dashboard)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-[#0A0D17] overflow-hidden font-sans text-[#F9FAFB] selection:bg-[#7F5AF0] selection:text-white">
      
      {/* 3. Pass State & Close Function to Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 4. DYNAMIC CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto bg-[#0A0D17] relative scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0A0D17] [&::-webkit-scrollbar-thumb]:bg-[#1F2937] hover:[&::-webkit-scrollbar-thumb]:bg-[#7F5AF0] [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* 5. INJECT PROPS INTO CHILDREN:
           This allows <Dashboard /> to receive 'toggleSidebar' automatically 
           without you needing to pass it manually in App.jsx.
        */}
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { toggleSidebar });
            }
            return child;
        })}
        
      </main>
    </div>
  );
};

export default Layout;