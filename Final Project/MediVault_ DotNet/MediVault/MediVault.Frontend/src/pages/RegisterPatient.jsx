import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './RegisterPatient.css';

const RegisterPatient = () => {
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', name: '', age: '', gender: 'Male', phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    // Map backend PascalCase keys to form field names
    const mapErrorKeys = (backendErrors) => {
        const mapping = {
            'username': 'username',
            'password': 'password',
            'email': 'email',
            'name': 'name',
            'age': 'age',
            'gender': 'gender',
            'phonenumber': 'phonenumber', // backend might return lowercase
            'phonenumber': 'phonenumber'  // or try both
        };
        
        const mapped = {};
        for (const [key, value] of Object.entries(backendErrors)) {
            const lowerKey = key.toLowerCase();
            mapped[lowerKey] = value;
        }
        return mapped;
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        // Client-side validation: username must contain only letters
        const usernameRegex = /^[A-Za-z]+$/;
        if (!formData.username || !usernameRegex.test(formData.username)) {
            setErrors({ username: ['Username must contain only letters (A-Z, a-z)'] });
            return;
        }

        // Client-side validation: phone number must be exactly 10 digits
        const phoneRegex = /^\d{10}$/;
        if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
            // use lowercase key to match how backend errors are mapped in this file
            setErrors({ phonenumber: ['Phone number must be exactly 10 digits'] });
            return;
        }

        try {
            setErrors({});
            const ageValue = formData.age ? parseInt(formData.age) : 0;
            await api.post('/auth/register/patient', {
                ...formData,
                age: ageValue
            });
            setToast({ show: true, message: 'Registration Successful! Redirecting to login...', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 400 && data?.errors) {
                const mapped = mapErrorKeys(data.errors);
                console.log('[RegisterPatient] Mapped errors:', JSON.stringify(mapped, null, 2));
                setErrors(mapped);
            } else {
                setToast({ show: true, message: data?.message || 'Registration failed', type: 'danger' });
            }
        }
    };

    return (
        <div className="register-container">
            {toast.show && (
                <div className={`alert alert-${toast.type} position-fixed top-0 start-50 translate-middle-x mt-3`} style={{ zIndex: 9999 }} role="alert">
                    {toast.message}
                </div>
            )}
            <div className="register-card">
                <h2 className="register-brand">MediVault</h2>
                <h3 className="register-title">Patient Registration</h3>
                <form className="register-form" onSubmit={handleRegister}>
                    <div className="row">
                        <div className="col-md-6 form-group">
                            <label className="form-label">Username</label>
                            <input 
                                className="form-control"
                                name="username" 
                                value={formData.username}
                                onChange={handleChange} 
                            />
                            {errors.username && <div className="text-danger small">{errors.username[0]}</div>}
                        </div>
                        <div className="col-md-6 form-group">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control"
                                name="password" 
                                value={formData.password}
                                onChange={handleChange} 
                            />
                            {errors.password && <div className="text-danger small">{errors.password[0]}</div>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            type="email" 
                            className="form-control"
                            name="email" 
                            value={formData.email}
                            onChange={handleChange} 
                        />
                        {errors.email && <div className="text-danger small">{errors.email[0]}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input 
                            className="form-control"
                            name="name" 
                            value={formData.name}
                            onChange={handleChange} 
                        />
                        {errors.name && <div className="text-danger small">{errors.name[0]}</div>}
                    </div>
                    <div className="row">
                        <div className="col-md-4 form-group">
                            <label className="form-label">Age</label>
                            <input 
                                type="number" 
                                className="form-control"
                                name="age" 
                                value={formData.age}
                                onChange={handleChange} 
                            />
                            {errors.age && <div className="text-danger small">{errors.age[0]}</div>}
                        </div>
                        <div className="col-md-4 form-group">
                            <label className="form-label">Gender</label>
                            <select 
                                className="form-select"
                                name="gender" 
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                            {errors.gender && <div className="text-danger small">{errors.gender[0]}</div>}
                        </div>
                        <div className="col-md-4 form-group">
                            <label className="form-label">Phone</label>
                            <input 
                                className="form-control"
                                name="phoneNumber" 
                                value={formData.phoneNumber}
                                onChange={handleChange} 
                            />
                            {errors.phonenumber && <div className="text-danger small">{errors.phonenumber[0]}</div>}
                        </div>
                    </div>
                    <button type="submit" className="btn register-btn">Register</button>
                    <div className="register-login-link">
                        <span className="text-muted">Already have an account?</span> <a href="/login">Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPatient;
