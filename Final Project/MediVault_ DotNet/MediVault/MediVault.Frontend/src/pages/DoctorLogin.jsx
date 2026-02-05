import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DoctorLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            console.log('[DoctorLogin] Attempting login with username:', username);
            const res = await api.post('/auth/login', { username, password });
            console.log('[DoctorLogin] Login response:', res.data);
            
            const token = res.data.token ?? res.data.Token;
            const role = res.data.role ?? res.data.Role;
            const userId = res.data.userId ?? res.data.UserId;
            const specificId = res.data.specificId ?? res.data.SpecificId;
            
            console.log('[DoctorLogin] Extracted values - Token:', !!token, 'Role:', role, 'UserId:', userId, 'SpecificId:', specificId);

            if (role !== 'Doctor') {
                setToast({ show: true, message: 'Invalid role. Please login as a doctor.', type: 'danger' });
                return;
            }

            if (!specificId || specificId === '0' || specificId === 0) {
                console.error('[DoctorLogin] Invalid specialId:', specificId);
                setToast({ show: true, message: 'Server did not return valid doctor ID. Contact support.', type: 'danger' });
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
            localStorage.setItem('doctorId', String(specificId));
            // Mirror the backend "specificId" name as well for consistency
            localStorage.setItem('specificId', specificId);
            console.log('[DoctorLogin] Stored doctorId in localStorage:', localStorage.getItem('doctorId'));

            setToast({ show: true, message: 'Login successful! Redirecting...', type: 'success' });
            setTimeout(() => {
                navigate('/doctor');
            }, 1500);
        } catch (err) {
            console.error('[DoctorLogin] Login error:', err);
            const data = err.response?.data;
            if (err.response?.status === 400 && data?.errors) {
                const mapped = Object.fromEntries(
                    Object.entries(data.errors).map(([k, v]) => [k.toLowerCase(), v])
                );
                setErrors(mapped);
            } else {
                setToast({ show: true, message: data?.message || 'Login failed', type: 'danger' });
            }
        }
    };

    return (
        <div>
            <Navbar />
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            {toast.show && (
                <div className={`alert alert-${toast.type} position-fixed top-0 start-50 translate-middle-x mt-3`} style={{ zIndex: 9999 }} role="alert">
                    {toast.message}
                </div>
            )}
            <div className="card shadow p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4 text-primary">MediVault</h2>
                <h5 className="text-center mb-3">Doctor Login</h5>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input 
                            className="form-control"
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                        {errors.username && <div className="text-danger small">{errors.username[0]}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control"
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                        {errors.password && <div className="text-danger small">{errors.password[0]}</div>}
                    </div>
                    <button className="btn btn-primary w-100">Login</button>
                </form>
            </div>
            </div>
        </div>
    );
};

export default DoctorLogin;
