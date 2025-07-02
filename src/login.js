import React from 'react';
import './login.css';

function Login() {
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
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button className="login-btn">LOGIN</button>
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
          <p><strong>ACADEMIC YEAR:</strong> 2024 - 2025</p>
          <p><strong>SEM:</strong> 2nd</p>
          <p><strong>START DATE:</strong> <span className="highlight">May 19, 2025 1:00 AM</span></p>
          <p><strong>END DATE:</strong> <span className="highlight">May 25, 2025 11:59 PM</span></p>
        </div>
      </div>

      {/* Footer */}
      <p className="login-footer">
        Today is <strong>Wednesday, July 28, 2025</strong>
      </p>
    </div>
  );
}

export default Login;
