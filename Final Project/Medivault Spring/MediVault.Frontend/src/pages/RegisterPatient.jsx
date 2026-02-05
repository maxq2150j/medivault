import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './RegisterPatient.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterPatient = () => {
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', name: '', age: '', gender: 'Male', phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
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

    // Simple client-side validation reused for real-time and on submit
    const validateField = (name, value, currentErrors) => {
        const newErrors = { ...currentErrors };

        if (name === 'username') {
            const usernameRegex = /^[A-Za-z]+$/;
            if (!value || !usernameRegex.test(value)) {
                newErrors.username = ['Username must contain only letters (A-Z, a-z)'];
            } else {
                delete newErrors.username;
            }
        }

        if (name === 'password') {
            // Rule: at least 8 chars, one uppercase, one special character
            const hasMinLength = value && value.length >= 8;
            const hasUppercase = /[A-Z]/.test(value || '');
            const hasSpecial = /[^A-Za-z0-9]/.test(value || '');

            if (!hasMinLength || !hasUppercase || !hasSpecial) {
                newErrors.password = ['Password must be at least 8 characters, with 1 uppercase letter and 1 special character'];
            } else {
                delete newErrors.password;
            }
        }

        if (name === 'email') {
            // Require a valid Gmail address
            const emailRegex = /^[^\s@]+@gmail\.com$/i;
            if (!value || !emailRegex.test(value)) {
                newErrors.email = ['Email must be a valid Gmail address ending with @gmail.com'];
            } else {
                delete newErrors.email;
            }
        }

        if (name === 'phoneNumber') {
            const phoneRegex = /^\d{10}$/;
            if (!value || !phoneRegex.test(value)) {
                newErrors.phonenumber = ['Phone number must be exactly 10 digits'];
            } else {
                delete newErrors.phonenumber;
            }
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Real-time validation for fields we have rules for
        setErrors(prev => validateField(name, value, prev));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Run validation once more on submit to catch untouched fields
        let currentErrors = {};
        currentErrors = validateField('username', formData.username, currentErrors);
        currentErrors = validateField('password', formData.password, currentErrors);
        currentErrors = validateField('email', formData.email, currentErrors);
        currentErrors = validateField('phoneNumber', formData.phoneNumber, currentErrors);
        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        try {
            setErrors({});
            const ageValue = formData.age ? parseInt(formData.age) : 0;
            const payload = {
                ...formData,
                age: ageValue,
                // backend enum expects MALE/FEMALE/OTHER
                gender: formData.gender.toUpperCase()
            };
            await api.post('/auth/register/patient', payload);
            toast.success('Registration Successful! Redirecting to login...');
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
                toast.error(data?.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="register-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="register-shell">
                <section className="register-panel register-panel-left">
                    <div className="register-brand-pill">MediVault</div>
                    <h1 className="register-hero-title">Create your secure patient account.</h1>
                    <p className="register-hero-text">
                        Store reports, prescriptions, and visit history in one place. Access your health
                        information whenever you need it.
                    </p>
                    <ul className="register-hero-bullets">
                        <li>View consultations and uploaded files</li>
                        <li>Share records with your hospital or doctor</li>
                        <li>Protected with secure login and validation</li>
                    </ul>
                </section>

                <section className="register-panel register-panel-right">
                    <div className="register-card">
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
                                <span className="text-muted">Already have an account?</span>{' '}
                                <a href="/login">Login</a>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default RegisterPatient;
