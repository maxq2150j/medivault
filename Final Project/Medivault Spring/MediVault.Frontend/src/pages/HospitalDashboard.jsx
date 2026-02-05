import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './HospitalDashboard.css';
import { useTheme } from '../context/ThemeContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HospitalDashboard = () => {
    const { isDark: isDarkTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('patients'); // 'patients' or 'doctors'
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const searchTimerRef = React.useRef(null);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Consultation Form
    const [consultation, setConsultation] = useState({ diagnosis: '', bp: '', sugar: '', temperature: '', medicines: '' });

    // File Upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('X-Ray');

    // Consultation Records
    const [consultations, setConsultations] = useState([]);

    // Doctor Registration
    const [doctorForm, setDoctorForm] = useState({ name: '', specialization: '', licenseNumber: '', phoneNumber: '', username: '', email: '', password: '', confirmPassword: '' });
    const [doctors, setDoctors] = useState([]);
    const [registeredDoctor, setRegisteredDoctor] = useState(null);
    const [doctorErrors, setDoctorErrors] = useState({});

    const hospitalId = sessionStorage.getItem('specificId') ? parseInt(sessionStorage.getItem('specificId')) : null;

    useEffect(() => {
        console.log('[HospitalDashboard] hospitalId from localStorage:', hospitalId);
        if (activeTab === 'doctors' && hospitalId) {
            fetchDoctors();
        }
    }, [activeTab, hospitalId]);

    const performSearch = async (query) => {
        try {
            if (!query || !query.trim()) {
                setPatients([]);
                return;
            }
            console.log('[HospitalDashboard] Searching for:', query);
            const res = await api.get(`/hospital/search-patient?query=${encodeURIComponent(query)}`);
            console.log('[HospitalDashboard] Search response:', res.data);
            console.log('[HospitalDashboard] Number of patients found:', res.data?.length || 0);
            setPatients(res.data || []);
            if ((res.data || []).length === 0) {
                toast.info('No patients found');
            }
        } catch (err) {
            console.error('[HospitalDashboard] Search error:', err.response?.status, err.response?.data);
            toast.error('Error searching: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSearch = async () => {
        // manual trigger (button)
        await performSearch(searchQuery);
    };

    // Auto-search as user types (debounced)
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 350);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    const fetchDoctors = async () => {
        try {
            if (!hospitalId) {
                console.error('[HospitalDashboard] Invalid hospitalId:', hospitalId);
                setDoctors([]);
                return;
            }
            console.log('[HospitalDashboard] Fetching doctors for hospitalId:', hospitalId);
            const res = await api.get(`/doctor/hospital/${hospitalId}`);
            console.log('[HospitalDashboard] Doctors fetched:', res.data);
            // API returns { doctors: [...] }
            setDoctors(res.data?.doctors || []);
        } catch (err) {
            console.error('[HospitalDashboard] Fetch doctors error:', err.response?.data || err.message);
            toast.error('Error fetching doctors: ' + (err.response?.data?.message || err.message));
        }
    };

    const validateDoctorForm = (form) => {
        const f = form || doctorForm;
        const errors = {};

        // Name: same as backend (letters and spaces only)
        {
            const nameRegex = /^[A-Za-z ]+$/;
            if (!f.name.trim() || !nameRegex.test(f.name.trim())) {
                errors.name = 'Doctor name can contain only letters and spaces';
            }
        }

        // Specialization: letters, spaces, and periods
        {
            const specializationRegex = /^[A-Za-z\. ]+$/;
            if (!f.specialization.trim() || !specializationRegex.test(f.specialization.trim())) {
                errors.specialization = 'Specialization can contain only letters, spaces, and periods (e.g., MBBS, M.Phil, Ph.D)';
            }
        }

        // License number: letters, digits, hyphens
        {
            const licenseRegex = /^[A-Za-z0-9-]+$/;
            if (!f.licenseNumber.trim() || !licenseRegex.test(f.licenseNumber.trim())) {
                errors.licenseNumber = 'License number can contain only letters, digits, and hyphens';
            }
        }

        // Phone number: Indian mobile (10 digits, starts with 6-9)
        {
            const phoneRegex = /^[6-9][0-9]{9}$/;
            if (!f.phoneNumber.trim() || !phoneRegex.test(f.phoneNumber.trim())) {
                errors.phoneNumber = 'Invalid Indian mobile number';
            }
        }

        // Username: start with letter, then letters/digits
        {
            const usernameRegex = /^[A-Za-z][A-Za-z0-9]*$/;
            if (!f.username.trim() || !usernameRegex.test(f.username.trim())) {
                errors.username = 'Username must start with a letter and contain only letters and digits';
            }
        }

        // Email: allowed domains (gmail.com, yahoo.in, outlook.com)
        {
            const domainRegex = /@(gmail\.com|yahoo\.in|outlook\.com)$/i;
            if (!f.email.trim() || !domainRegex.test(f.email.trim())) {
                errors.email = 'Email domain is not allowed';
            }
        }

        // Password: same complexity as backend
        {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!f.password || !passwordRegex.test(f.password)) {
                errors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
            }
        }

        // Confirm password
        if (!f.confirmPassword) {
            errors.confirmPassword = 'Confirm password is required';
        } else if (f.password && f.password !== f.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const handleRegisterDoctor = async (e) => {
        e.preventDefault();
        const errors = validateDoctorForm(doctorForm);
        if (Object.keys(errors).length > 0) {
            setDoctorErrors(errors);
            return;
        }

        if (!hospitalId) {
            toast.error('Hospital ID not found. Please logout and login again.');
            return;
        }

        setDoctorErrors({});

        try {
            console.log('[HospitalDashboard] Registering doctor with hospitalId:', hospitalId);
            const payload = {
                hospitalId,
                name: doctorForm.name,
                specialization: doctorForm.specialization,
                licenseNumber: doctorForm.licenseNumber,
                phoneNumber: doctorForm.phoneNumber,
                username: doctorForm.username,
                email: doctorForm.email,
                password: doctorForm.password
            };
            console.log('[HospitalDashboard] Payload:', JSON.stringify(payload, null, 2));
            const res = await api.post('/auth/register/doctor', payload);

            // Show registered doctor credentials
            setRegisteredDoctor({
                name: doctorForm.name,
                username: doctorForm.username,
                password: doctorForm.password,
                email: doctorForm.email
            });

            // Reset form
            setDoctorForm({ name: '', specialization: '', licenseNumber: '', phoneNumber: '', username: '', email: '', password: '', confirmPassword: '' });

            // Show success toast
            toast.success('Doctor registered successfully! Share the credentials below.');

            // Refresh doctor list
            await fetchDoctors();
        } catch (err) {
            const errorData = err.response?.data;
            console.error('[HospitalDashboard] Register doctor error:', errorData);
            if (errorData?.errors) {
                setDoctorErrors(errorData.errors);
                toast.error('Validation errors. Please check the form.');
            } else {
                toast.error(errorData?.message || 'Error registering doctor');
            }
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
    };




    const handleFileUpload = async (e) => {
        e.preventDefault();
        try {
            if (!selectedFile) { toast.warning('Please select a file'); return; }

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('patientId', selectedPatient.id);
            formData.append('fileType', fileType);

            console.log('[HospitalDashboard] Uploading file...', { patientId: selectedPatient.id, fileType });
            await api.post('/hospital/upload-file', formData);
            toast.success('File uploaded successfully!');
            setSelectedFile(null);
        } catch (err) {
            console.error('[HospitalDashboard] Upload error:', err.response?.status, err.response?.data);
            toast.error('Error uploading file: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleDoctorActive = async (doctorId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            console.log('[HospitalDashboard] Toggling doctor', doctorId, 'to', newStatus);

            const res = await api.put(`/hospital/doctors/${doctorId}/active`, { isActive: newStatus });
            console.log('[HospitalDashboard] Toggle response:', res.data);

            toast.success(res.data.message);
            await fetchDoctors(); // Refresh doctor list
        } catch (err) {
            console.error('[HospitalDashboard] Toggle doctor error:', err.response?.data || err.message);
            toast.error('Error updating doctor status: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className={`hospital-dashboard ${isDarkTheme ? 'theme-dark' : 'light-mode'}`}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Navbar />
            <div className="container mt-4 hospital-dashboard-container">
                <div className="hospital-dashboard-hero">
                    <div>
                        <h1 className="dashboard-title">Hospital Dashboard</h1>
                        <p className="dashboard-subtitle">
                            Search patients, upload medical records, and manage your doctors from a single, modern workspace.
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <ul className="nav nav-tabs mt-4 hospital-dashboard-tabs">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
                            Patient Consultations
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
                            Manage Doctors
                        </button>
                    </li>
                </ul>

                {/* Patient Tab */}
                {activeTab === 'patients' && (
                    <div className="tab-pane-wrapper">
                        {!selectedPatient && (
                            <div className="card p-4 mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="section-title mb-0">Search Patient</h4>
                                    <span className="section-hint">Search by phone number or name to start a consultation.</span>
                                </div>
                                <div className="d-flex">
                                    <input className="form-control me-2" placeholder="Phone Number or Name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>

                                {patients.length > 0 && (
                                    <table className="table hospital-table mt-3">
                                        <thead><tr><th>Name</th><th>Age</th><th>Phone</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {patients.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.age}</td>
                                                    <td>{p.phoneNumber}</td>
                                                    <td><button className="btn btn-sm btn-info" onClick={() => handleSelectPatient(p)}>Select</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {selectedPatient && (
                            <div className="tab-pane-wrapper">
                                {/* File Upload Section */}
                                <div className="card p-4 mt-3">
                                    <h4 className="section-title">Upload Medical Files for {selectedPatient.name}</h4>
                                    <form onSubmit={handleFileUpload}>
                                        <div className="row">
                                            <div className="col-md-4 mb-2">
                                                <select className="form-control" value={fileType} onChange={e => setFileType(e.target.value)}>
                                                    <option>Report</option>
                                                    <option>X-Ray</option>
                                                    <option>Blood Test</option>
                                                    <option>CT Scan</option>
                                                    <option>Ultrasound</option>
                                                    <option>Prescription</option>
                                                    <option>Lab Report</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-8 mb-2">
                                                <input type="file" className="form-control" onChange={e => setSelectedFile(e.target.files[0])} />
                                            </div>
                                        </div>
                                        <button className="btn btn-success w-100">Upload File</button>
                                    </form>
                                </div>

                                <button className="btn btn-secondary mt-3" onClick={() => setSelectedPatient(null)}>Back to Search</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Doctor Management Tab */}
                {activeTab === 'doctors' && (
                    <div className="tab-pane-wrapper">
                        {/* Register Doctor Section */}
                        <div className="card p-4 mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="section-title mb-0">Register New Doctor</h4>
                                <span className="section-hint">Create secure login access for doctors attached to your hospital.</span>
                            </div>
                            <form onSubmit={handleRegisterDoctor}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${doctorErrors.name ? 'is-invalid' : ''}`}
                                            value={doctorForm.name}
                                            onChange={e => {
                                                const updated = { ...doctorForm, name: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.name && <div className="invalid-feedback">{doctorErrors.name}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Specialization *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${doctorErrors.specialization ? 'is-invalid' : ''}`}
                                            placeholder="e.g., Cardiology, Orthopedics"
                                            value={doctorForm.specialization}
                                            onChange={e => {
                                                const updated = { ...doctorForm, specialization: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.specialization && <div className="invalid-feedback">{doctorErrors.specialization}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">License Number *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${doctorErrors.licenseNumber ? 'is-invalid' : ''}`}
                                            value={doctorForm.licenseNumber}
                                            onChange={e => {
                                                const updated = { ...doctorForm, licenseNumber: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.licenseNumber && <div className="invalid-feedback">{doctorErrors.licenseNumber}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className={`form-control ${doctorErrors.phoneNumber ? 'is-invalid' : ''}`}
                                            value={doctorForm.phoneNumber}
                                            onChange={e => {
                                                const updated = { ...doctorForm, phoneNumber: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.phoneNumber && <div className="invalid-feedback">{doctorErrors.phoneNumber}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Username *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${doctorErrors.username ? 'is-invalid' : ''}`}
                                            value={doctorForm.username}
                                            onChange={e => {
                                                const updated = { ...doctorForm, username: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.username && <div className="invalid-feedback">{doctorErrors.username}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className={`form-control ${doctorErrors.email ? 'is-invalid' : ''}`}
                                            value={doctorForm.email}
                                            onChange={e => {
                                                const updated = { ...doctorForm, email: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.email && <div className="invalid-feedback">{doctorErrors.email}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Password (min 8 chars, upper/lowercase, number, special) *</label>
                                        <input
                                            type="password"
                                            className={`form-control ${doctorErrors.password ? 'is-invalid' : ''}`}
                                            value={doctorForm.password}
                                            onChange={e => {
                                                const updated = { ...doctorForm, password: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.password && <div className="invalid-feedback">{doctorErrors.password}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirm Password *</label>
                                        <input
                                            type="password"
                                            className={`form-control ${doctorErrors.confirmPassword ? 'is-invalid' : ''}`}
                                            value={doctorForm.confirmPassword}
                                            onChange={e => {
                                                const updated = { ...doctorForm, confirmPassword: e.target.value };
                                                setDoctorForm(updated);
                                                setDoctorErrors(validateDoctorForm(updated));
                                            }}
                                        />
                                        {doctorErrors.confirmPassword && <div className="invalid-feedback">{doctorErrors.confirmPassword}</div>}
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">Register Doctor</button>
                            </form>
                        </div>

                        {/* Registered Doctor Credentials */}
                        {registeredDoctor && (
                            <div className="card p-4 mt-3 bg-success bg-opacity-10">
                                <h5 className="text-success">✓ Doctor Registered Successfully!</h5>
                                <p className="mb-2"><strong>Name:</strong> {registeredDoctor.name}</p>
                                <p className="mb-2"><strong>Username:</strong> <code>{registeredDoctor.username}</code></p>
                                <p className="mb-2"><strong>Password:</strong> <code>{registeredDoctor.password}</code></p>
                                <p className="mb-2"><strong>Email:</strong> {registeredDoctor.email}</p>
                                <p className="text-muted mb-0">⚠️ Share these credentials with the doctor. They can login at the Doctor Login page.</p>
                                <button
                                    className="btn btn-sm btn-outline-secondary mt-2"
                                    onClick={() => setRegisteredDoctor(null)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Registered Doctors List */}
                        <div className="card p-4 mt-3">
                            <h5>Doctors in Your Hospital</h5>
                            {doctors.length === 0 ? (
                                <p className="text-muted">No doctors registered yet.</p>
                            ) : (
                                <table className="table hospital-table hospital-table-doctors">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Specialization</th>
                                            <th>License</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.map(doc => (
                                            <tr key={doc.id}>
                                                <td>{doc.name}</td>
                                                <td>{doc.specialization}</td>
                                                <td>{doc.licenseNumber}</td>
                                                <td>{doc.phoneNumber}</td>
                                                <td>
                                                    <span className={`badge ${doc.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                        {doc.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`btn btn-sm ${doc.isActive ? 'btn-warning' : 'btn-success'}`}
                                                        onClick={() => toggleDoctorActive(doc.id, doc.isActive)}
                                                        title={doc.isActive ? 'Deactivate doctor' : 'Activate doctor'}
                                                    >
                                                        {doc.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalDashboard;
