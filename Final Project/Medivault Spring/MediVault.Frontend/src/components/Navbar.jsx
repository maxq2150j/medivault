import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useTheme } from '../context/ThemeContext.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('role');
    const { isDark, toggleTheme } = useTheme();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('specificId');
        setIsMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="brand" onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo/logo.png" alt="MediVault Logo" className="brand-logo" />
                    <span className="brand-text">MediVault</span>
                </Link>

                <button
                    className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
                    type="button"
                    aria-label="Toggle navigation"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    {!token && (
                        <>
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/about"
                                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                        </>
                    )}
                    {token && userRole === 'Patient' && (
                        <Link
                            to="/patient"
                            className={`nav-link ${isActive('/patient') ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            My Dashboard
                        </Link>
                    )}
                    {token && userRole === 'Hospital' && (
                        <Link
                            to="/hospital"
                            className={`nav-link ${isActive('/hospital') ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hospital Dashboard
                        </Link>
                    )}
                    {token && userRole === 'Doctor' && (
                        <Link
                            to="/doctor"
                            className={`nav-link ${isActive('/doctor') ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Doctor Dashboard
                        </Link>
                    )}
                    {token && userRole === 'Admin' && (
                        <Link
                            to="/admin"
                            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Admin Dashboard
                        </Link>
                    )}
                    {!token ? (
                        <div className="auth-buttons">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/login');
                                }}
                                className="login-btn"
                            >
                                Login
                            </button>
                        </div>
                    ) : (
                        <div className="user-section">
                            <span className="user-role">{userRole}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
                    <div className="theme-toggle-wrapper">
                        <button
                            type="button"
                            className={`theme-toggle-pill ${isDark ? 'dark' : 'light'}`}
                            onClick={toggleTheme}
                        >
                            <span className="theme-option theme-option-light">LIGHT</span>
                            <span className="theme-option theme-option-dark">DARK</span>
                            <span className="theme-thumb" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
