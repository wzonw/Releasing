import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { MdAccountCircle } from "react-icons/md";

function Header() {
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
              Employee Name
            </h1>
            <p className='desc'>
              Clerk-in-Charge
            </p>
          </div>
          <MdAccountCircle className='acc-icon'/>
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