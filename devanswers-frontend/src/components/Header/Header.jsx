import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaStackOverflow, FaUser, FaSignOutAlt, FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { logoutUser } from '../../reducers/userSlice.js';
import { toggleTheme } from '../../reducers/themeSlice.js';
import Navbar from '../Navbar/Navbar.jsx';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const isAuthenticated = !!userInfo;
  const { isDarkMode } = useSelector((state) => state.theme);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleCloseMobileMenu = () => setShowMobileMenu(false);
  const handleShowMobileMenu = () => setShowMobileMenu(true);

  const handleLogin = () => {
    navigate('/login');
  }

  const handleSignup = () => {
    navigate('/register');
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header-left">
        <Button 
          variant="link" 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="d-md-none text-white p-0 me-2 header-hamburger"
        >
          <FaBars />
        </Button>
        <h1 onClick={() => navigate('/')} className="header-logo">
          <FaStackOverflow className="logo-icon" />
          DevAnswers
        </h1>
      </div>
      
      <div className="header-right">
        <Button 
          variant="outline-light" 
          onClick={() => dispatch(toggleTheme())}
          className="me-2 header-theme-btn"
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </Button>
        {isAuthenticated ? (
          <>
            <Button 
              variant="link" 
              onClick={() => navigate('/profile')}
              className="text-white me-3 d-none d-md-inline header-profile-btn"
            >
              <FaUser className="me-2" />
              {userInfo?.name || 'User'}
            </Button>
            <Button variant="light" onClick={handleLogout}>
              <FaSignOutAlt className="me-2 d-none d-sm-inline" />
              <span className="d-none d-sm-inline">Logout</span>
              <FaSignOutAlt className="d-sm-none" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="light" onClick={handleLogin}>
              <span className="d-none d-sm-inline">Login</span>
              <FaUser className="d-sm-none" />
            </Button>
            <Button variant="outline-light" onClick={handleSignup}>
              <span className="d-none d-sm-inline">Sign Up</span>
              <span className="d-sm-none">+</span>
            </Button>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <>
          <div className="mobile-drawer-backdrop" onClick={handleCloseMobileMenu} />
          <div className="header-mobile-menu header-mobile-menu--open">
            <div className="header-mobile-menu-header">
              <span className="header-mobile-menu-title">
                <FaStackOverflow className="me-2 header-mobile-menu-icon" />
                DevAnswers
              </span>
              <Button variant="link" onClick={handleCloseMobileMenu} className="header-mobile-menu-close">
                ✕
              </Button>
            </div>
            <div className="header-mobile-menu-body">
              <Navbar onLinkClick={handleCloseMobileMenu} />
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;