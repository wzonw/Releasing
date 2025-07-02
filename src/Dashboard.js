import { useState } from 'react';
import './Dashboard.css';
import Header from './Header';

function Dashboard() {
  const [filter, setFilter] = useState('All Time');
  const [showDropdown, setShowDropdown] = useState(false);

  const filters = ['All Time', 'Last Week', 'Last Month', 'Last Year'];

  const handleSelect = (option) => {
    setFilter(option);
    setShowDropdown(false);
  };

  return (
    <div className='dash-bg'>
      <Header/>
      <img
        src="/images/PLM.jpg"
        alt="Pamantasan ng Lungsod ng Maynila university logo displayed prominently in a dashboard interface, surrounded by a clean and professional digital environment"
        className='dashbg'
      />
      <div className="overview-container">
        <div className="overview-card">
          <div className="overview-left">
            <h2>Document Overview</h2>
            <p className="total-label">Total Requests</p>
            <h1 className="total-count">950</h1>
            <div className="breakdown">
              <p>Pending <span>210</span></p>
              <p>Processing <span>135</span></p>
              <p>Shelf <span>240</span></p>
              <p>Released <span>365</span></p>
            </div>
          </div>

          <div className="overview-right">
            <div className="dropdown">
              <button className="dropdown-button" onClick={() => setShowDropdown(!showDropdown)}>
                {filter} <span className="arrow">▾</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  {filters.map((option) => (
                    <button
                      key={option}
                      className="dropdown-option"
                      onClick={() => handleSelect(option)}
                      disabled={option === 'Last Year'}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard