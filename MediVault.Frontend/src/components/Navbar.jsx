import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="brand">
                    MediVault
                </Link>
                <div className="nav-links">
                    {!token && (
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/about" className="nav-link">About Us</Link>
                            <Link to="/contact" className="nav-link">Contact Us</Link>
                        </>
                    )}
                    {token && userRole === 'Patient' && (
                        <Link to="/patient" className="nav-link">My Dashboard</Link>
                    )}
                    {token && userRole === 'Hospital' && (
                        <Link to="/hospital" className="nav-link">Hospital Dashboard</Link>
                    )}
                    {token && userRole === 'Doctor' && (
                        <Link to="/doctor" className="nav-link">Doctor Dashboard</Link>
                    )}
                    {token && userRole === 'Admin' && (
                        <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                    )}
                    {!token ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => navigate('/login')} className="login-btn">
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
