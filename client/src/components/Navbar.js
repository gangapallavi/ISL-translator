import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    onLogout();
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="navbar-logo">
            <img 
              src="icon.jpg" 
              alt="Hastha Vaani Logo" 
              className="navbar-icon" 
            />
            Hastha Vaani
          </Link>
          
          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="navbar-item">
              <Link to="/" className="navbar-link">Dashboard</Link>
            </li>
            <li className="navbar-item">
              <Link to="/learn" className="navbar-link">Learn</Link>
            </li>
            <li className="navbar-item">
              <Link to="/gesture" className="navbar-link">Gesture</Link>
            </li>
            <li className="navbar-item">
              <Link to="/tesseract" className="navbar-link">Tesseract</Link>
            </li>
            {/* <li className="navbar-item">
              <Link to="/stt" className="navbar-link">Speech to Text</Link>
            </li> */}
          </ul>
        </div>
        
        <div className="navbar-right" style={{ marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <div className="user-profile" onClick={toggleDropdown}>
              <div className="user-avatar">
                <span>{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'up' : 'down'}`}></span>
              {isDropdownOpen && (
                <ul className="dropdown-menu">
                  <li className="dropdown-item">
                    <Link to="#" className="dropdown-link">Profile</Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="#" className="dropdown-link">Settings</Link>
                  </li>
                  <li className="dropdown-divider"></li>
                  <li className="dropdown-item">
                    <button onClick={handleLogout} className="dropdown-button">Logout</button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="auth-links d-flex gap-2">
              <Link to="/login" className="btn btn-primary btn-sm w-auto rounded-pill">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm w-auto rounded-pill">Sign Up</Link>
            </div>
          )}
        </div>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <div className="toggle-icon"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;