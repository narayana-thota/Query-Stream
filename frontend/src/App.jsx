import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- PAGES ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TodoListPage from './pages/TodoList';       // Matches 'TodoList.jsx' in Explorer
import PDFManagerPage from './pages/PdfManager';   // Matches 'PdfManager.jsx' in Explorer
import PodcastGenPage from './pages/podcastgenerator'; // ⚠️ FIXED: Matches 'podcastgenerator.jsx' (lowercase)

// --- COMPONENTS ---
// Assuming you have this, otherwise remove the wrapper
import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/layout'; // ⚠️ FIXED: Matches 'layout.jsx' (lowercase tab)

import './App.css';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (No Layout) --- */}
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