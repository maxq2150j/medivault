import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './PatientDashboard.css';
import { useTheme } from '../context/ThemeContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PatientDashboard = () => {
    const { isDark: isDarkTheme } = useTheme();
    const formatIST = (dateValue) => {
        // Force render in Asia/Kolkata to avoid client-local timezone shifts
        return new Date(`${dateValue}Z`).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    };
    const [profile, setProfile] = useState({});
    const [records, setRecords] = useState([]);
    const [otpHistory, setOtpHistory] = useState([]);
    const [medicalFiles, setMedicalFiles] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [appointmentForm, setAppointmentForm] = useState({ hospitalId: '', doctorId: '', date: '', notes: '' });
    const [paymentModal, setPaymentModal] = useState({ show: false, appointmentId: null, amount: 0, orderId: null });
    const [showAppointments, setShowAppointments] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchRecords();
        fetchOtpHistory();
        fetchMedicalFiles();
        fetchConsultations();
        fetchHospitals();
        fetchAppointments();
    }, []);


    const fetchProfile = async () => {
        try { const res = await api.get('/patient/profile'); setProfile(res.data); fetchMedicalFiles(res.data.id); } catch (e) { console.error('Profile error:', e); }
    };
    const fetchRecords = async () => {
        try { const res = await api.get('/patient/records'); setRecords(res.data); } catch (e) { console.error('Records error:', e); }
    };
    const fetchOtpHistory = async () => {
        try { const res = await api.get('/patient/otp-history'); setOtpHistory(res.data); } catch (e) { console.error('OTP history error:', e); }
    };
    const fetchMedicalFiles = async (patientId = profile.id) => {
        try { const res = await api.get(`/hospital/patient-files/${patientId}`); setMedicalFiles(res.data); } catch (e) { console.error('Medical files error:', e); }
    };
    const fetchConsultations = async () => {
        try {
            console.log('[PatientDashboard] Fetching consultations...');
            const res = await api.get('/patient/consultations');
            console.log('[PatientDashboard] Consultations response:', res.data);
            setConsultations(res.data);
        } catch (e) {
            console.error('[PatientDashboard] Consultations error:', e.response?.data || e.message);
        }
    };

    const fetchHospitals = async () => {
        try { const res = await api.get('/patient/hospitals'); setHospitals(res.data); } catch (e) { console.error('Hospitals error:', e.response?.data || e.message); }
    };

    const fetchDoctors = async (hospitalId) => {
        if (!hospitalId) { setDoctors([]); return; }
        try { const res = await api.get(`/patient/doctors-by-hospital/${hospitalId}`); setDoctors(res.data); } catch (e) { console.error('Doctors error:', e.response?.data || e.message); }
    };

    const fetchAppointments = async () => {
        try { const res = await api.get('/patient/appointments'); setAppointments(res.data); } catch (e) { console.error('Appointments error:', e.response?.data || e.message); }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayNow = async (appointmentId) => {
        try {
            // Initiate payment
            const res = await api.post(`/patient/appointments/${appointmentId}/initiate-payment`);
            const { orderId, amount, razorpayKeyId, patientName, patientEmail } = res.data;

            // Load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Failed to load payment gateway. Please try again.');
                return;
            }

            // Open Razorpay payment modal
            const options = {
                key: razorpayKeyId,
                amount: amount * 100, // Razorpay expects amount in paise
                currency: 'INR',
                order_id: orderId,
                name: 'MediVault',
                description: `Appointment Payment - ID: ${appointmentId}`,
                prefill: {
                    name: patientName,
                    email: patientEmail || ''
                },
                handler: async (response) => {
                    try {
                        // Verify payment
                        await api.post(`/patient/appointments/${appointmentId}/verify-payment`, {
                            PaymentId: response.razorpay_payment_id,
                            Signature: response.razorpay_signature
                        });
                        toast.success('Payment successful! Your appointment is now approved.');
                        fetchAppointments();
                        setPaymentModal({ show: false, appointmentId: null, amount: 0, orderId: null });
                    } catch (err) {
                        toast.error('Payment verification failed: ' + (err.response?.data?.message || 'Please try again'));
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPaymentModal({ show: false, appointmentId: null, amount: 0, orderId: null });
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            toast.error('Error initiating payment: ' + (err.response?.data?.message || err.message));
        }
    };

    const submitAppointment = async (e) => {
        e.preventDefault();
        const { hospitalId, doctorId, date, notes } = appointmentForm;
        if (!hospitalId || !doctorId || !date) {
            toast.error('Select hospital, doctor, and date/time');
            return;
        }
        try {
            await api.post('/patient/appointments', {
                HospitalId: parseInt(hospitalId, 10),
                DoctorId: parseInt(doctorId, 10),
                AppointmentDate: new Date(date),
                Notes: notes
            });
            setAppointmentForm({ hospitalId: '', doctorId: '', date: '', notes: '' });
            fetchAppointments();
            setShowBooking(false); // Close modal on success
            toast.success('Appointment requested successfully!');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to book appointment');
        }
    };

    return (
        <div className={`patient-dashboard ${isDarkTheme ? 'theme-dark' : 'light-mode'}`}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Navbar />
            <div className="container mt-4 patient-dashboard-container">
                {/* Hero & Profile Header */}
                <div className="patient-dashboard-hero d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                        <h1 className="dashboard-title">Patient Dashboard</h1>
                        <p className="dashboard-subtitle">
                            Welcome back, {profile.name || 'Patient'}
                        </p>
                    </div>
                    <div className="text-end d-flex align-items-center gap-3">
                        <div className="text-end">
                            <h5 className="mb-0 fw-bold">{profile.name || 'User'}</h5>
                            <small className="d-block text-muted">{profile.age ? `${profile.age} yrs` : ''} {profile.gender ? `| ${profile.gender}` : ''}</small>
                            <small className="d-block text-muted">{profile.phoneNumber}</small>
                        </div>
                        <div className="profile-avatar shadow-sm">
                            {(profile.name || 'P').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                {showBooking && (
                    <div className="booking-modal-overlay" onClick={() => setShowBooking(false)}>
                        <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Book New Appointment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowBooking(false)} aria-label="Close"></button>
                            </div>
                            <div className="card-body">
                                <form onSubmit={submitAppointment}>
                                    <div className="row g-4 gx-5"> {/* Increased gap between columns */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Hospital</label>
                                            <select className="form-select form-select-sm" value={appointmentForm.hospitalId} onChange={(e) => { const v = e.target.value; setAppointmentForm({ ...appointmentForm, hospitalId: v, doctorId: '' }); fetchDoctors(v); }}>
                                                <option value="">Select hospital</option>
                                                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Doctor</label>
                                            <select className="form-select form-select-sm" value={appointmentForm.doctorId} onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}>
                                                <option value="">Select doctor</option>
                                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-select-sm"
                                                min={new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                                                value={appointmentForm.date}
                                                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Notes</label>
                                            <input type="text" className="form-control form-select-sm" placeholder="Reason for visit" value={appointmentForm.notes} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="text-center mt-4"> {/* Centered buttons */}
                                        <button className="btn btn-sm btn-outline-secondary me-2 px-3" type="button" onClick={() => setShowBooking(false)}>Cancel</button>
                                        <button className="btn btn-sm btn-outline-success px-3" type="submit">Confirm Booking</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid - 2x2 Layout */}
                <div className="row g-3">

                    {/* 1. Appointments (Top Left) */}
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">My Appointments</span>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => setShowBooking(true)}
                                    >
                                        + Book
                                    </button>
                                </div>
                            </div>

                            {/* Always show appointment list here for visibility in grid */}
                            <div className="card-body">
                                {appointments.length === 0 ? <div className="p-3 text-center text-muted small">No appointments scheduled.</div> : (
                                    <div className="list-group list-group-flush">
                                        {appointments.slice(0, 5).map(a => (
                                            <div className="list-group-item" key={a.id}>
                                                <div className="d-flex w-100 justify-content-between align-items-start">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="fw-bold small">{a.doctorName || 'Doctor'}</div>
                                                        <div className="d-flex align-items-center mt-1" style={{ fontSize: '0.75rem' }}>
                                                            <span className="text-muted text-truncate" style={{ maxWidth: '55%' }}>{a.hospitalName}</span>
                                                            <small className="text-muted border px-1 rounded ms-2" style={{ fontSize: '0.7rem' }}>
                                                                {formatIST(a.appointmentDate)}
                                                            </small>
                                                            <span className={`badge ms-auto ${a.status === 'Approved' ? 'bg-success' : a.status === 'Denied' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>{a.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-end ms-2">
                                                        {a.paymentRequired && a.paymentStatus !== 'Completed' && (
                                                            <button
                                                                className="btn btn-sm btn-warning py-0 px-2"
                                                                style={{ fontSize: '0.7rem' }}
                                                                onClick={() => handlePayNow(a.id)}
                                                            >
                                                                Pay
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {appointments.length > 5 && (
                                    <div className="p-2 text-center border-top bg-light">
                                        <small className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setShowAppointments(!showAppointments)}>
                                            View all {appointments.length} appointments
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Medical Records (Top Right) */}
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Medical Records</span>
                                <span className="badge bg-secondary rounded-pill">{records.length}</span>
                            </div>
                            <div className="card-body">
                                {records.length === 0 ? (
                                    <div className="p-3 text-center text-muted small">
                                        <div className="fw-semibold mb-1">No medical records yet</div>
                                        <div className="mb-2">After your consultations, your doctor or hospital will upload reports here.</div>
                                        <div className="small">
                                            <div>• Ask your doctor to upload lab reports or prescriptions.</div>
                                            <div>• You can also upload files from the Files & Reports section below.</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {records.slice(0, 5).map(r => (
                                            <div className="list-group-item" key={r.id}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="me-2 text-truncate">
                                                        <div className="fw-bold small text-truncate" title={r.hospitalName}>{r.hospitalName}</div>
                                                        <div className="small text-muted text-truncate" title={r.doctorName}>Dr. {r.doctorName}</div>
                                                    </div>
                                                    <small className="text-muted text-nowrap" style={{ fontSize: '0.75rem' }}>
                                                        {formatIST(r.date)}
                                                    </small>
                                                </div>
                                                <div className="mt-1 small text-muted text-truncate" title={r.diagnosis}>
                                                    <strong>Diagnosis:</strong> {r.diagnosis || '-'}
                                                </div>
                                                <div className="small text-muted text-truncate" title={r.medicines}>
                                                    <strong>Medicines:</strong> {r.medicines || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Consultations (Bottom Left) */}
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Consultations</span>
                                <span className="badge bg-secondary rounded-pill">{consultations.length}</span>
                            </div>
                            <div className="card-body">
                                {consultations.length === 0 ? (
                                    <div className="p-3 text-center text-muted small">
                                        <div className="fw-semibold mb-1">No consultations recorded</div>
                                        <div className="mb-2">After your doctor finishes a consultation, summary reports will show here.</div>
                                        <div className="small">You can still view upcoming visits in the My Appointments section.</div>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {consultations.slice(0, 5).map(c => (
                                            <div className="list-group-item d-flex justify-content-between align-items-center" key={c.id}>
                                                <div className="me-2 text-truncate">
                                                    <div className="fw-bold small">Report</div>
                                                    <div className="small text-muted">{new Date(c.date).toLocaleDateString()}</div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={() => {
                                                        const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
                                                        if (c.pdfPath) {
                                                            const path = c.pdfPath || '';
                                                            const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
                                                            window.location.href = url;
                                                            return;
                                                        }
                                                        const report = `CONSULTATION REPORT\nDate: ${new Date(c.date).toLocaleString()}\n\nBP: ${c.bp}\nTemp: ${c.temperature}\nDiagnosis: ${c.diagnosis}\nMedicines: ${c.medicines}`;
                                                        const element = document.createElement('a'); element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report)); element.setAttribute('download', 'report.txt'); document.body.appendChild(element); element.click(); document.body.removeChild(element);
                                                    }}
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Medical Files (Bottom Right) */}
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Files & Reports</span>
                                <span className="badge bg-secondary rounded-pill">{medicalFiles.length}</span>
                            </div>
                            <div className="card-body">
                                {medicalFiles.length === 0 ? (
                                    <div className="p-3 text-center text-muted small">
                                        <div className="fw-semibold mb-1">No files uploaded</div>
                                        <div className="mb-2">Scans, lab reports, and other documents will be listed here.</div>
                                        <div className="small">Ask your hospital to upload past reports so you can access them anytime.</div>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {medicalFiles.map(f => (
                                            <div className="list-group-item d-flex justify-content-between align-items-center" key={f.id}>
                                                <div className="me-2 text-truncate">
                                                    <div className="fw-bold small text-truncate" title={f.fileName}>{f.fileName}</div>
                                                    <div className="small text-muted text-truncate">{f.fileType}</div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={() => {
                                                        const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
                                                        const path = f.filePath || '';
                                                        const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
                                                        window.location.href = url;
                                                    }}
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
