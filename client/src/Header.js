import { React, useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { MdAccountCircle, MdLogin } from "react-icons/md";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    // setShowMenu(false);

  };
  return (
    <div className='Header'>
      <div className='dashboard-bg'>
        <img className='bg-image' src='images/plm_trans.png' alt='PLM'/>
        <div className='title1'>
            <img src="plm_logo.png" alt='PLM Logo' className='logo-header'/>
            <h1 className='title'>
              OFFICE OF THE UNIVERSITY REGISTRAR
            </h1>
            <p className='subTitle'>
              Pamantasan ng Lungsod ng Maynila
            </p>
        </div>
          <div className='emp'>
            <div className='emp-text'>
              <h1 className='emp-acc'>
                {user ? `${user.fullname}` : "Employee Name"}
              </h1>
              <p className='desc'>
                Clerk-in-Charge
              </p>
            </div>
            <div className='account-dropdown'>
              <button className='but' onClick={toggleMenu}>
              <MdAccountCircle className='acc-icon'/>
              </button>
              {showMenu && (
                  <div className='dropdown-menu'>
                    <button onClick={handleLogout} className='logout-btn'>
                      <MdLogin className='logout-icon'/>
                      Logout
                    </button>
                  </div>
                )}
            </div>
          </div>
      </div>
      <div className='tabs'> 
        <h2>
          <Link to="/dashboard">Dashboard</Link>
        </h2>
        <h2>
          <Link to="/req">Requests</Link>
        </h2>
        <h2>
          <Link to="/upload">Upload</Link>
        </h2>
      </div>
    </div>
  )
}

export default Header