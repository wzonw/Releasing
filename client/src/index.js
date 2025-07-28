import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import Header from './Header';
import Request from './Request';
import reportWebVitals from './reportWebVitals';
import Upload  from './Upload';
// import App from './App';
import Monitor from './Monitor';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<App />} /> default router tinanggal*/} 
        <Route path="*" element={<Navigate to="login" replace />}/>
        <Route path="/header" element={<Header/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/req" element={<Request />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/monitor" element={<Monitor/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
