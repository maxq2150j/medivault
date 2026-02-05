import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext.jsx';
import './DoctorDashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DoctorDashboard = () => {
    const { isDark } = useTheme();
    const formatIST = (dateValue) => {
        // Force render in Asia/Kolkata to avoid client-local timezone shifts
        return new Date(`${dateValue}Z`).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    };
    const [doctorId, setDoctorId] = useState(null);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const searchTimerRef = useRef(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [accessRequestId, setAccessRequestId] = useState(null);
    const [otp, setOtp] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [pastConsultations, setPastConsultations] = useState([]);
    const [consultation, setConsultation] = useState({
        diagnosis: '',
        bp: '',
        sugar: '',
        temperature: '',
        medicines: ''
    });
    const [activeTab, setActiveTab] = useState('profile');
    const [profileForm, setProfileForm] = useState({ name: '', specialization: '', phoneNumber: '', profilePicture: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({});
    const pastConsultationsRef = useRef(null);
        const [appointments, setAppointments] = useState([]);
        const [paymentModal, setPaymentModal] = useState({ show: false, appointmentId: null, patientName: '', amount: '' });

        useEffect(() => {
		const id = sessionStorage.getItem('doctorId');
		console.log('[DoctorDashboard] doctorId from sessionStorage:', id);
        if (!id || id === 'undefined' || id === '0') {
            toast.warning('Invalid doctor ID. Please login again.');
            return;
        }
        setDoctorId(id);
    }, []);

    useEffect(() => {
        if (doctorId && doctorId !== '0' && doctorId !== 'undefined') {
            console.log('[DoctorDashboard] Fetching profile for doctorId:', doctorId);
            fetchDoctorProfile();
            fetchAppointments();
        }
    }, [doctorId]);

    const fetchDoctorProfile = async () => {
        try {
            console.log('[DoctorDashboard] Making request to /doctor/' + doctorId);
            const res = await api.get(`/doctor/${doctorId}`);
            console.log('[DoctorDashboard] Profile fetched:', res.data);
            setDoctorProfile(res.data.doctor);
            const d = res.data.doctor;
            setProfileForm({
                name: d?.name || '',
                specialization: d?.specialization || '',
                phoneNumber: d?.phoneNumber || '',
                profilePicture: d?.profilePicture || ''
            });
        } catch (err) {
            console.error('[DoctorDashboard] Fetch error:', err.response?.data || err.message);
            toast.error('Failed to fetch doctor profile: ' + (err.response?.data?.message || err.message));
        }
    };

    const fetchAppointments = async () => {
        if (!doctorId) return;
        try {
            const res = await api.get(`/doctor/${doctorId}/appointments`);
            setAppointments(res.data || []);
        } catch (err) {
            console.error('[DoctorDashboard] Appointments error:', err.response?.data || err.message);
        }
    };

    const performSearch = async (query) => {
        if (!query || !query.trim()) {
            setPatients([]);
            return;
        }
        try {
            console.log('[DoctorDashboard] Searching for patient:', query);
            // Reuse existing hospital search endpoint for patients
            const res = await api.get(`/hospital/search-patient?query=${encodeURIComponent(query)}`);
            console.log('[DoctorDashboard] Search results:', res.data);
            setPatients(res.data || []);
            if ((res.data || []).length === 0) {
                toast.info('No patients found');
            }
        } catch (err) {
            console.error('[DoctorDashboard] Search error:', err.response?.data || err.message);
            toast.error('Error searching patients: ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    const searchPatient = (e) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    // Auto-search as user types with a small debounce
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 350);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    const requestAccess = async (patientId) => {
        try {
            const res = await api.post('/doctor/request-access', {
                doctorId,
                patientId
            });
            setAccessRequestId(res.data.accessRequestId);
            setOtpVerified(false);
            setOtp('');
            setOtp('');
            toast.success('OTP has been sent to patient email address.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request access');
        }
    };

    const verifyOTP = async () => {
        if (!otp.trim()) {
            toast.warning('Please enter OTP');
            return;
        }
        try {
            const res = await api.post('/doctor/verify-otp', {
                accessRequestId,
                otp
            });
            setOtpVerified(true);
            setAccessRequestId(res.data.accessRequestId);

            // Fetch patient's past consultations
            if (selectedPatient) {
                const historyRes = await api.get(`/doctor/patient-history/${selectedPatient.id}?doctorId=${doctorId}&accessRequestId=${res.data.accessRequestId}`);
                setPastConsultations(historyRes.data.consultations || []);
            }

            toast.success('OTP verified! You can now record consultation.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        }
    };

    const updateAppointmentStatus = async (appointmentId, status) => {
        try {
            await api.post(`/doctor/appointments/${appointmentId}/status`, {
                DoctorId: parseInt(doctorId, 10),
                Status: status
            });
            fetchAppointments();
            fetchAppointments();
            toast.success(`Appointment ${status.toLowerCase()}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update appointment');
        }
    };

    const openPaymentRequestModal = (appointment) => {
        setPaymentModal({
            show: true,
            appointmentId: appointment.id,
            patientName: appointment?.patientName || 'Patient',
            amount: appointment?.paymentAmount || ''
        });
    };

    const requestPaymentFromPatient = async (e) => {
        e.preventDefault();

        if (!paymentModal.amount || paymentModal.amount <= 0) {
            toast.warning('Please enter a valid amount');
            return;
        }
        try {
            await api.post(`/doctor/appointments/${paymentModal.appointmentId}/request-payment`, {
                DoctorId: parseInt(doctorId, 10),
                Amount: parseFloat(paymentModal.amount)
            });
            setPaymentModal({ show: false, appointmentId: null, patientName: '', amount: '' });
            fetchAppointments();
            setPaymentModal({ show: false, appointmentId: null, patientName: '', amount: '' });
            fetchAppointments();
            toast.success('Payment request sent to patient');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request payment');
        }
    };

    const generateConsultationReport = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !otpVerified) {
            toast.warning('Please verify OTP first');
            return;
        }

        try {
            // First, save consultation to database
            const doctorIdInt = parseInt(doctorId || '0', 10);
            // Prefer camelCase from API, fallback to PascalCase if serializer preserved it
            const hospitalId = parseInt(
                doctorProfile?.hospital?.id ??
                doctorProfile?.Hospital?.Id ??
                doctorProfile?.hospitalId ??
                0,
                10
            );


            if (!doctorIdInt || !hospitalId) {
                toast.error('Doctor or hospital not loaded. Please refresh and try again.');
                return;
            }
            console.log('[DoctorDashboard] Submitting consultation:', {
                doctorId,
                patientId: selectedPatient.id,
                hospitalId,
                doctorProfile
            });

            const res = await api.post('/doctor/submit-consultation', {
                DoctorId: doctorIdInt,
                PatientId: selectedPatient.id,
                HospitalId: hospitalId,
                Diagnosis: consultation.diagnosis,
                BP: consultation.bp,
                Sugar: consultation.sugar,
                Temperature: consultation.temperature,
                Medicines: consultation.medicines
            });
            // Log full response for debugging
            console.log('[DoctorDashboard] submit-consultation response:', res?.data);

            // If server returned a PdfUrl, open it in a new tab. Otherwise fall back to text download
            const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
            if (res?.data?.PdfUrl) {
                try {
                    const pdfUrl = `${base}${res.data.PdfUrl}`;
                    console.log('[DoctorDashboard] Opening PDF at', pdfUrl);
                    window.open(pdfUrl, '_blank', 'noopener');
                    toast.success('Consultation PDF generated and opened');
                } catch (err) {
                    console.error('Failed to open PDF:', err);
                    toast.warning('Consultation saved but failed to open PDF');
                }
            } else {
                // Generate text report as fallback
                const report = `MEDICAL CONSULTATION REPORT\n=====================================\nDate: ${new Date().toLocaleString()}\nDoctor: ${doctorProfile?.name || 'N/A'}\nSpecialization: ${doctorProfile?.specialization || 'N/A'}\nLicense: ${doctorProfile?.licenseNumber || 'N/A'}\n\nPATIENT INFORMATION\n=====================================\nName: ${selectedPatient.name || 'N/A'}\nAge: ${selectedPatient.age || 'N/A'}\nGender: ${selectedPatient.gender || 'N/A'}\n\nCONSULTATION DETAILS\n=====================================\nBlood Pressure: ${consultation.bp || 'N/A'}\nSugar Level: ${consultation.sugar || 'N/A'}\nTemperature: ${consultation.temperature || 'N/A'}°C\n\nDIAGNOSIS\n=====================================\n${consultation.diagnosis || 'N/A'}\n\nMEDICINES PRESCRIBED\n=====================================\n${consultation.medicines || 'N/A'}\n\n=====================================\nGenerated on: ${new Date().toLocaleString()}`;

                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
                element.setAttribute('download', `consultation_${selectedPatient.id}_${Date.now()}.txt`);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);

                toast.success('Consultation report saved and downloaded successfully');
            }

            // Reload past consultations to show the newly created one
            if (selectedPatient) {
                try {
                    const historyRes = await api.get(`/doctor/patient-history/${selectedPatient.id}?doctorId=${doctorId}&accessRequestId=${accessRequestId}`);
                    setPastConsultations(historyRes.data.consultations || []);
                } catch (err) {
                    console.log('Error reloading consultations:', err);
                }
            }

            setConsultation({ diagnosis: '', bp: '', sugar: '', temperature: '', medicines: '' });

            // Scroll to past consultations section after a brief delay
            setTimeout(() => {
                if (pastConsultationsRef.current) {
                    pastConsultationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);

        } catch (err) {
            toast.error('Failed to generate report: ' + (err.response?.data?.message || err.message));
        }
    };



    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: profileForm.name,
                specialization: profileForm.specialization,
                phoneNumber: profileForm.phoneNumber,
                profilePicture: profileForm.profilePicture
            };
            const res = await api.put(`/doctor/${doctorId}/profile`, payload);
            const updated = res.data.doctor || res.data;
            setDoctorProfile(updated);
            setProfileForm({
                name: updated.name || '',
                specialization: updated.specialization || '',
                phoneNumber: updated.phoneNumber || '',
                profilePicture: updated.profilePicture || ''
            });

            toast.success(res.data.message || 'Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword.trim()) errors.currentPassword = 'Current password is required';
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
        if (!/[A-Z]/.test(passwordForm.newPassword)) errors.newPassword = 'New password must contain at least one uppercase letter';
        if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        return errors;
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        const errors = validatePasswordForm();
        if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }
        setPasswordErrors({});
        try {
            await api.put(`/doctor/${doctorId}/password`, {
                CurrentPassword: passwordForm.currentPassword,
                NewPassword: passwordForm.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password';
            toast.error(msg);
        }
    };

    return (
        <div className={`doctor-dashboard ${isDark ? 'theme-dark' : 'light-mode'}`}>
            <Navbar />
            <div className="container-fluid mt-4 doctor-dashboard-container">
                <div className="row mb-4">
                    <div className="col">
                        <div className="card doctor-hero-card">
                            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <div>
                                    <h3 className="mb-1">Doctor Dashboard</h3>
                                    <p className="text-muted mb-0">Manage your profile, consultations, and appointments in one place.</p>
                                </div>
                                {doctorProfile && (
                                    <div className="mt-3 mt-md-0 text-md-end">
                                        <div className="fw-semibold">{doctorProfile.name}</div>
                                        <div className="text-muted small">{doctorProfile.specialization}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* ToastContainer placed here */}
                <ToastContainer position="top-right" autoClose={3000} />

                <div className="row">
                    <div className="col-md-3 mb-3 mb-md-0">
                        <div className="card text-center mb-3 doctor-sidebar-card">
                            <div className="card-body">
                                {doctorProfile?.profilePicture ? (
                                    <img
                                        src={doctorProfile.profilePicture}
                                        alt="Profile"
                                        className="rounded-circle mb-3"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle mb-3 bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '150px', height: '150px', margin: '0 auto' }}
                                    >
                                        <span className="text-muted">No Image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card doctor-sidebar-card">
                            <div className="card-body">
                                <h5 className="card-title">Doctor Profile</h5>
                                {doctorProfile && (
                                    <>
                                        <p><strong>Name:</strong> {doctorProfile.name}</p>
                                        <p><strong>Specialization:</strong> {doctorProfile.specialization}</p>
                                        <p><strong>Phone:</strong> {doctorProfile.phoneNumber}</p>
                                        <p><strong>License:</strong> {doctorProfile.licenseNumber}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-9">
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                    Profile
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
                                    Consultations
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
                                    Appointments
                                </button>
                            </li>
                        </ul>

                        {activeTab === 'profile' && (
                            <div className="card doctor-main-card">
                                <div className="card-body">
                                    <h5 className="card-title">Update Profile</h5>
                                    <form onSubmit={updateProfile}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Full Name</label>
                                                <input className="form-control" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Specialization</label>
                                                <input className="form-control" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <input className="form-control" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Profile Picture URL</label>
                                                <input className="form-control" value={profileForm.profilePicture} onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="submit" className="btn btn-primary">Save Changes</button>
                                            <button type="button" className="btn btn-secondary" onClick={() => {
                                                if (doctorProfile) {
                                                    setProfileForm({
                                                        name: doctorProfile.name || '',
                                                        specialization: doctorProfile.specialization || '',
                                                        phoneNumber: doctorProfile.phoneNumber || '',
                                                        profilePicture: doctorProfile.profilePicture || ''
                                                    });
                                                }
                                            }}>Reset to current</button>
                                        </div>
                                    </form>
                                    <hr className="my-4" />
                                    <h5 className="card-title">Change Password</h5>
                                    <form onSubmit={updatePassword}>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Current Password</label>
                                                <input type="password" className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                                                {passwordErrors.currentPassword && <div className="invalid-feedback">{passwordErrors.currentPassword}</div>}
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">New Password</label>
                                                <input type="password" className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                                {passwordErrors.newPassword && <div className="invalid-feedback">{passwordErrors.newPassword}</div>}
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Confirm New Password</label>
                                                <input type="password" className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                                                {passwordErrors.confirmPassword && <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>}
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="submit" className="btn btn-warning">Update Password</button>
                                            <button type="button" className="btn btn-secondary" onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}>Clear</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'patients' && (
                            <div className="card doctor-main-card">
                                <div className="card-body">
                                    <h5 className="card-title">Patient Consultation</h5>

                                    {!selectedPatient && !otpVerified && (
                                        <div className="mb-4">
                                            <h6>Search Patient</h6>
                                            <form onSubmit={searchPatient} className="mb-3">
                                                <div className="d-flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter patient name..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </form>

                                            {patients.length > 0 && (
                                                <div className="table-responsive">
                                                    <h6 className="mt-3">Search Results</h6>
                                                    <table className="table table-sm table-hover doctor-search-table">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Age</th>
                                                                <th>Gender</th>
                                                                <th>Phone</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {patients.map(p => (
                                                                <tr key={p.id}>
                                                                    <td>{p.name}</td>
                                                                    <td>{p.age}</td>
                                                                    <td>{p.gender}</td>
                                                                    <td>{p.phoneNumber}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-sm btn-primary"
                                                                            onClick={() => {
                                                                                setSelectedPatient(p);
                                                                                requestAccess(p.id);
                                                                            }}
                                                                        >
                                                                            Request OTP
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {accessRequestId && !otpVerified && (
                                        <div className="p-3 bg-warning bg-opacity-25 border border-warning rounded mb-3">
                                            <h6>Verify OTP</h6>
                                            <p className="text-muted small">OTP has been sent to the patient</p>
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength="6"
                                            />
                                            <button className="btn btn-success btn-sm" onClick={verifyOTP}>
                                                Verify OTP
                                            </button>
                                        </div>
                                    )}

                                    {otpVerified && selectedPatient && (
                                        <div>
                                            <div className="alert alert-success">
                                                ✓ OTP Verified! You can now record consultation.
                                            </div>

                                            {/* Past Consultations Section */}
                                            {pastConsultations.length > 0 && (
                                                <div className="mb-4" ref={pastConsultationsRef}>
                                                    <h6 className="mb-3">📋 Past Consultations</h6>
                                                    <div className="card doctor-past-card">
                                                        <div className="card-body">
                                                            {pastConsultations.map((consultation, idx) => (
                                                                <div key={idx} className="mb-3 pb-3 border-bottom">
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <strong>Date:</strong> {new Date(consultation.date).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <strong>Diagnosis:</strong> {consultation.diagnosis || 'N/A'}
                                                                    </div>
                                                                    <div className="row mt-2">
                                                                        <div className="col-md-3">
                                                                            <strong>BP:</strong> {consultation.bp || 'N/A'}
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <strong>Sugar:</strong> {consultation.sugar || 'N/A'}
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <strong>Temp:</strong> {consultation.temperature || 'N/A'}°C
                                                                        </div>
                                                                    </div>
                                                                    {consultation.medicines && (
                                                                        <div className="mt-2">
                                                                            <strong>Medicines:</strong> {consultation.medicines}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <form onSubmit={generateConsultationReport}>
                                                <h6 className="mb-3">Consultation Details</h6>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Blood Pressure</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g., 120/80"
                                                            value={consultation.bp}
                                                            onChange={(e) => setConsultation({ ...consultation, bp: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Sugar Level</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g., 100 mg/dL"
                                                            value={consultation.sugar}
                                                            onChange={(e) => setConsultation({ ...consultation, sugar: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Temperature</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="e.g., 98.6"
                                                        value={consultation.temperature}
                                                        onChange={(e) => setConsultation({ ...consultation, temperature: e.target.value })}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Diagnosis</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        placeholder="Enter diagnosis..."
                                                        value={consultation.diagnosis}
                                                        onChange={(e) => setConsultation({ ...consultation, diagnosis: e.target.value })}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Medicines Prescribed</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        placeholder="Enter medicines with dosage..."
                                                        value={consultation.medicines}
                                                        onChange={(e) => setConsultation({ ...consultation, medicines: e.target.value })}
                                                    />
                                                </div>

                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-success">
                                                        Generate & Download Report
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setSelectedPatient(null);
                                                            setOtpVerified(false);
                                                            setOtp('');
                                                            setConsultation({ diagnosis: '', bp: '', sugar: '', temperature: '', medicines: '' });
                                                        }}
                                                    >
                                                        Start New Consultation
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && (
                            <div className="card doctor-main-card">
                                <div className="card-body">
                                    <h5 className="card-title">Appointments</h5>
                                    {appointments.length === 0 ? <p>No appointments yet.</p> : (
                                        <div className="list-group">
                                            {appointments.map(a => {
                                                const statusRaw = a.status || '';
                                                const status = statusRaw.toUpperCase();
                                                const statusLabel = status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Pending';
                                                const isPending = status === 'PENDING';
                                                const isApproved = status === 'APPROVED';
                                                const isDenied = status === 'DENIED';
                                                return (
                                                    <div className="list-group-item" key={a.id}>
                                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-1">{a.patientName || 'Patient'}</h6>
                                                                <small className="text-muted">{formatIST(a.appointmentDate)}</small>
                                                                {a.notes && <div><small>Notes: {a.notes}</small></div>}
                                                                {a.paymentRequired && <div><small className="text-info">💰 Payment Requested: ₹{a.paymentAmount}</small></div>}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                <span className={`badge ${isApproved ? 'bg-success' : isDenied ? 'bg-danger' : 'bg-secondary'}`}>{statusLabel}</span>
                                                                {a.paymentCompleted && <span className="badge bg-info">✓ Paid</span>}
                                                                {a.paymentRequired && !a.paymentCompleted && <span className="badge bg-warning">Pending Payment</span>}
                                                                {isPending && (
                                                                    <>
                                                                        {!a.paymentRequired && (
                                                                            <button
                                                                                className="btn btn-sm btn-success"
                                                                                onClick={() => openPaymentRequestModal(a)}
                                                                            >
                                                                                Request Fees
                                                                            </button>
                                                                        )}
                                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => updateAppointmentStatus(a.id, 'Denied')}>Deny</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModal.show && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content doctor-modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Request Payment</h5>
                                <button type="button" className="btn-close" onClick={() => setPaymentModal({ show: false, appointmentId: null, patientName: '', amount: '' })}></button>
                            </div>
                            <form onSubmit={requestPaymentFromPatient}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient Name</label>
                                        <input type="text" className="form-control" value={paymentModal.patientName} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Payment Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter amount in rupees"
                                            value={paymentModal.amount}
                                            onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                                            step="0.01"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="alert alert-info">
                                        <small>Payment request will be sent to the patient. They can pay using Razorpay.</small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setPaymentModal({ show: false, appointmentId: null, patientName: '', amount: '' })}>Cancel</button>
                                    <button type="submit" className="btn btn-success">Send Payment Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
