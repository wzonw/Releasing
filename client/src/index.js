import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Dashboard from './Dashboard';
import Login from './Login';
import Request from './Request';
import Upload from './Upload';
import Monitor from './Monitor';
import ProtectedRoute from './ProtectedRoute';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/req"
          element={
            <ProtectedRoute>
              <Request />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <Monitor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
