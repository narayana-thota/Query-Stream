// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 🔍 UPDATED: We now check for 'userEmail' because the 
  // secure token is hidden in a cookie (HTTP-Only).
  // If 'userEmail' exists, it means the frontend knows you are logged in.
  const isAuthenticated = localStorage.getItem('userEmail');

  if (!isAuthenticated) {
    // If we don't know who you are, go back to login
    return <Navigate to="/login" replace />;
  }

  // If you are logged in, show the Dashboard
  return children;
};

export default ProtectedRoute;