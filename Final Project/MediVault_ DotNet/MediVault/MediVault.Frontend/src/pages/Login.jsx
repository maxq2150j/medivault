import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            const res = await api.post('/auth/login', { username, password });
            // Support both camelCase and PascalCase from backend
            const token = res.data.token ?? res.data.Token;
            const role = res.data.role ?? res.data.Role;
            const userId = res.data.userId ?? res.data.UserId;
            const specificId = res.data.specificId ?? res.data.SpecificId;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
            localStorage.setItem('specificId', specificId);
            // Ensure doctor dashboards read the same key name used elsewhere
            if (role === 'Doctor') {
                localStorage.setItem('doctorId', String(specificId));
            }

            setToast({ show: true, message: 'Login successful! Redirecting...', type: 'success' });
            setTimeout(() => {
                if (role === 'Patient') navigate('/patient');
                else if (role === 'Hospital') navigate('/hospital');
                else if (role === 'Admin') navigate('/admin');
                            else if (role === 'Doctor') navigate('/doctor');
            }, 1500);
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 400 && data?.errors) {
                const mapped = Object.fromEntries(
                    Object.entries(data.errors).map(([k, v]) => [k.toLowerCase(), v])
                );
                console.log('[Login] Mapped errors:', JSON.stringify(mapped, null, 2));
                setErrors(mapped);
            } else {
                setToast({ show: true, message: data?.message || 'Login failed', type: 'danger' });
            }
        }
    };

    return (
        <div className="login-container">
            {toast.show && (
                <div className={`alert alert-${toast.type} position-fixed top-0 start-50 translate-middle-x mt-3`} style={{ zIndex: 9999 }} role="alert">
                    {toast.message}
                </div>
            )}
            <div className="login-card">
                <h2 className="login-title">MediVault</h2>
                <h5 className="login-subtitle">Secure Login</h5>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input 
                            className="form-control"
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                        {errors.username && <div className="text-danger small">{errors.username[0]}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control"
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                        {errors.password && <div className="text-danger small">{errors.password[0]}</div>}
                    </div>
                    <button type="submit" className="btn login-btn">Login</button>
                    <div className="login-register-link">
                        <span className="text-muted">Don't have an account?</span> <a href="/register">Register</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
