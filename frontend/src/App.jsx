import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- PAGES ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
// 🔧 FIXED: Imports now match the filenames we created (PascalCase)
import TodoListPage from './pages/TodoList'; 
import PDFManagerPage from './pages/PdfManager'; 
import PodcastGenPage from './pages/podcastgenerator'; 

// --- COMPONENTS ---
import ProtectedRoute from './components/ProtectedRoute'; 
// Ensure your file is named 'Layout.jsx' or 'layout.jsx' and matches this import exactly
import Layout from './components/layout'; 

import './App.css';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (No Layout) --- */}
      {/* 🔧 FIXED: This redirect prevents the blank screen on homepage */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- PROTECTED ROUTES (With Sidebar Layout) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/todo"
        element={
          <ProtectedRoute>
            <Layout>
              <TodoListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pdf"
        element={
          <ProtectedRoute>
            <Layout>
              <PDFManagerPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/podcast"
        element={
          <ProtectedRoute>
            <Layout>
              <PodcastGenPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;