import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaHome, FaTags, FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ onLinkClick }) => {
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;
    
    return (
        <nav className="sidebar-nav">
            <Nav className="flex-column">
                <Nav.Link 
                    as={Link} 
                    to="/" 
                    onClick={onLinkClick}
                    className={`nav-item-custom ${isActive('/') ? 'active' : ''}`}
                >
                    <FaHome className="nav-icon" />
                    <span>Home</span>
                </Nav.Link>
                <Nav.Link 
                    as={Link} 
                    to="/tags" 
                    onClick={onLinkClick}
                    className={`nav-item-custom ${isActive('/tags') ? 'active' : ''}`}
                >
                    <FaTags className="nav-icon" />
                    <span>Tags</span>
                </Nav.Link>
                <Nav.Link 
                    as={Link} 
                    to="/profile" 
                    onClick={onLinkClick}
                    className={`nav-item-custom ${isActive('/profile') ? 'active' : ''}`}
                >
                    <FaUser className="nav-icon" />
                    <span>Profile</span>
                </Nav.Link>
            </Nav>
            <div className="sidebar-footer">
                <small className="text-muted">© 2026 DevAnswers</small>
            </div>
        </nav>
    )
}

export default Navbar;