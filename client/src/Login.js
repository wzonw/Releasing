import React, { useState } from 'react';
import './login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('https://releasing.onrender.com/server/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Login successful!');
        window.location.href = "/dashboard";
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error Logging In');
    }
  };

  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedToday = today.toLocaleDateString('en-US', options);

  // const formatDateTime = (date) =>
    // date.toLocaleDateString('en-US', {
      // month: 'long',
      // day: 'numeric',
      // year: 'numeric',
      // hour: 'numeric',
      // minute: '2-digit',
      // hour12: true,
    // });

  return (
    <div className="login-container">
      {/* Header */}
      <div className="login-header">
        <img src="plm_logo.png" alt="PLM Logo" className="login-logo" />
        <h1>PAMANTASAN NG LUNGSOD NG MAYNILA</h1>
        <p>Intramuros, Manila</p>
        <h2>OUR MANAGEMENT SYSTEM (OMS)</h2>
      </div>

      {/* Main Section */}
      <div className="login-card">
        {/* Login Form */}
        <div className="login-form">
          <h3>SIGN IN</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(prev => !prev)}
              style={{ marginRight: '5px' }}
            />
            Show Password
          </label>
          <button className="login-btn" onClick={handleLogin}>LOGIN</button>
          <button
            type="button"
            className="help-btn"
            onClick={() => alert('Redirecting to Help Page')}
          >
            Need Help?
          </button>
        </div>

        {/* Releasing Window */}
        <div className="releasing-window">
          <h4>RELEASING WINDOW</h4>
          <p><strong>CATEGORY:</strong> Undergraduate - Graduating Students</p>
        </div>
      </div>

      {/* Footer */}
      <p className="login-footer">
        Today is <strong>{formattedToday}</strong>
      </p>
    </div>
  );
}

export default Login;
