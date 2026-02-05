import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const GOOGLE_CLIENT_ID = '288517356420-lvut9fcdm1tkohet3f2qnb687mk3pp49.apps.googleusercontent.com';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            const res = await api.post('/auth/login', { username, password });
            // Support both camelCase and PascalCase from backend
            const token = res.data.token ?? res.data.Token;
            const roleRaw = res.data.role ?? res.data.Role;
            const role = roleRaw ? roleRaw.toUpperCase() : '';
            const userId = res.data.userId ?? res.data.UserId;
            const specificId = res.data.specificId ?? res.data.SpecificId;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('specificId', specificId);
            // Ensure doctor dashboards read the same key name used elsewhere
            if (role === 'DOCTOR') {
                sessionStorage.setItem('doctorId', String(specificId));
            }

            toast.success('Login successful! Redirecting...');
            setTimeout(() => {
                if (role === 'PATIENT') navigate('/patient');
                else if (role === 'HOSPITAL') navigate('/hospital');
                else if (role === 'ADMIN') navigate('/admin');
                else if (role === 'DOCTOR') navigate('/doctor');
            }, 1500);
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;
            if (status === 400 && data?.errors) {
                const mapped = Object.fromEntries(
                    Object.entries(data.errors).map(([k, v]) => [k.toLowerCase(), v])
                );
                console.log('[Login] Mapped errors:', JSON.stringify(mapped, null, 2));
                setErrors(mapped);
            } else if (status === 401 || status === 403) {
                // Wrong username/password or unauthorized; show backend message if present
                if (data?.message) {
                    toast.error(data.message);
                } else {
                    toast.error('Invalid credentials');
                }
            } else {
                toast.error(data?.message || 'Login failed');
            }
        }
    };

    const handleGoogleResponse = async (response) => {
        try {
            const idToken = response.credential;
            const res = await api.post('/auth/login/google', { idToken });
            const token = res.data.token ?? res.data.Token;
            const roleRaw = res.data.role ?? res.data.Role;
            const role = roleRaw ? roleRaw.toUpperCase() : '';
            const userId = res.data.userId ?? res.data.UserId;
            const specificId = res.data.specificId ?? res.data.SpecificId;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('specificId', specificId);
            if (role === 'DOCTOR') {
                sessionStorage.setItem('doctorId', String(specificId));
            }

            toast.success('Logged in with Google! Redirecting...');
            setTimeout(() => {
                if (role === 'PATIENT') navigate('/patient');
                else if (role === 'HOSPITAL') navigate('/hospital');
                else if (role === 'ADMIN') navigate('/admin');
                else if (role === 'DOCTOR') navigate('/doctor');
            }, 1500);
        } catch (err) {
            const data = err.response?.data;
            toast.error(data?.message || 'Google login failed');
        }
    };

    useEffect(() => {
        // Load Google Identity Services script and render the button
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                const div = document.getElementById('googleSignInDiv');
                if (div) {
                    window.google.accounts.id.renderButton(div, {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: 'continue_with',
                        shape: 'pill',
                        width: 280,
                    });
                }
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="login-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="login-shell">
                <section className="login-panel login-panel-left">
                    <div className="login-brand-pill">MediVault</div>
                    <h1 className="login-hero-title">Welcome back to your health vault.</h1>
                    <p className="login-hero-text">
                        View consultations, reports, and medical files in one secure place. Hospitals, doctors,
                        and patients stay connected through MediVault.
                    </p>
                    <ul className="login-hero-bullets">
                        <li>Role-based access for patients, hospitals, and doctors</li>
                        <li>Digital storage for prescriptions and lab reports</li>
                        <li>Fast, OTP-secured authentication</li>
                    </ul>
                </section>

                <section className="login-panel login-panel-right">
                    <div className="login-card">
                        <h2 className="login-title">Log in</h2>
                        <h5 className="login-subtitle">Enter your MediVault credentials</h5>
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
                            <div className="login-or">or</div>
                            <div id="googleSignInDiv" className="google-signin-container"></div>
                            <div className="login-register-link">
                                <span className="text-muted">Don't have an account?</span>{' '}
                                <a href="/register">Register</a>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;
