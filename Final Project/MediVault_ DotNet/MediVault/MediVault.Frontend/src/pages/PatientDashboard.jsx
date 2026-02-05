import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const formatIST = (dateValue) => {
        // Force render in Asia/Kolkata to avoid client-local timezone shifts
        return new Date(`${dateValue}Z`).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    };

    const getMinDateTime = () => {
        // Get current time in IST and format for datetime-local input
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const year = istTime.getFullYear();
        const month = String(istTime.getMonth() + 1).padStart(2, '0');
        const day = String(istTime.getDate()).padStart(2, '0');
        const hours = String(istTime.getHours()).padStart(2, '0');
        const minutes = String(istTime.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
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
                alert('Failed to load payment gateway. Please try again.');
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
                        alert('Payment successful!');
                        fetchAppointments();
                        setPaymentModal({ show: false, appointmentId: null, amount: 0, orderId: null });
                    } catch (err) {
                        alert('Payment verification failed: ' + (err.response?.data?.message || 'Please try again'));
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
            alert('Error initiating payment: ' + (err.response?.data?.message || err.message));
        }
    };

    const submitAppointment = async (e) => {
        e.preventDefault();
        const { hospitalId, doctorId, date, notes } = appointmentForm;
        if (!hospitalId || !doctorId || !date) {
            alert('Select hospital, doctor, and date/time');
            return;
        }

        // Validate appointment date is not in the past
        const minDateTime = getMinDateTime();
        if (date < minDateTime) {
            alert('Appointment date and time cannot be in the past. Please select a future date and time.');
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
            alert('Appointment requested');
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to book appointment');
        }
    };

    return (
        <div className="patient-dashboard">
            <Navbar />
            <div className="container mt-4">
                <h2 className="mb-4">Patient Dashboard</h2>

                <div className="row">
                    <div className="col-md-4">
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">My Profile</div>
                            <div className="card-body d-flex align-items-center gap-3">
                                <div className="profile-avatar">
                                    {(profile.name || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h5 className="mb-1">{profile.name || 'Patient'}</h5>
                                    <p className="mb-1">Age: {profile.age} | Gender: {profile.gender}</p>
                                    <p className="mb-0">Phone: {profile.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">Book Appointment</div>
                            <div className="card-body">
                                <form onSubmit={submitAppointment}>
                                    <div className="mb-2">
                                        <label className="form-label">Hospital</label>
                                        <select className="form-select" value={appointmentForm.hospitalId} onChange={(e) => { const v = e.target.value; setAppointmentForm({ ...appointmentForm, hospitalId: v, doctorId: '' }); fetchDoctors(v); }}>
                                            <option value="">Select hospital</option>
                                            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Doctor</label>
                                        <select className="form-select" value={appointmentForm.doctorId} onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}>
                                            <option value="">Select doctor</option>
                                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={appointmentForm.date}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                            min={getMinDateTime()}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Notes</label>
                                        <textarea className="form-control" value={appointmentForm.notes} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} rows="2" />
                                    </div>
                                    <button className="btn btn-success w-100" type="submit">Request Appointment</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0">Appointments</h4>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowAppointments(!showAppointments)}
                            >
                                {showAppointments ? 'Hide My Appointments' : 'Show My Appointments'}
                            </button>
                        </div>

                        {showAppointments && (
                            <div className="card mb-3 shadow-sm border border-primary">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h4 className="mb-0">My Appointments</h4>
                                            <small className="text-muted">All upcoming and past bookings</small>
                                        </div>
                                        <span className="badge bg-primary">{appointments.length} total</span>
                                    </div>
                                    {appointments.length === 0 ? <p className="mb-0">No appointments yet.</p> : (
                                        <div className="list-group mb-0">
                                            {appointments.map(a => (
                                                <div className="list-group-item" key={a.id}>
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <div style={{ flex: 1 }}>
                                                            <h6 className="mb-1">{a.doctorName || 'Doctor'} @ {a.hospitalName || 'Hospital'}</h6>
                                                            <small className="text-muted">{formatIST(a.appointmentDate)}</small>
                                                            {a.notes && <div><small>Notes: {a.notes}</small></div>}
                                                            {a.paymentRequired && (
                                                                <div className="mt-2">
                                                                    <small>
                                                                        <strong>Payment Required:</strong> ₹{a.paymentAmount} |
                                                                        <span className={`ms-2 ${a.paymentStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>
                                                                            {a.paymentStatus === 'Completed' ? '✓ Paid' : '⏳ Pending'}
                                                                        </span>
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="mb-2">
                                                                <span className={`badge ${a.status === 'Approved' ? 'bg-success' : a.status === 'Denied' ? 'bg-danger' : 'bg-secondary'}`}>{a.status}</span>
                                                            </div>
                                                            {a.paymentRequired && a.paymentStatus !== 'Completed' && (
                                                                <button
                                                                    className="btn btn-sm btn-warning"
                                                                    onClick={() => handlePayNow(a.id)}
                                                                >
                                                                    💳 Pay Now
                                                                </button>
                                                            )}
                                                            {a.paymentRequired && a.paymentStatus === 'Completed' && (
                                                                <span className="badge bg-success">Payment Complete</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="card shadow-sm border border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h4 className="mb-0">Medical Records</h4>
                                        <small className="text-muted">Uploaded records from hospitals</small>
                                    </div>
                                    <span className="badge bg-primary">{records.length}</span>
                                </div>
                                {records.length === 0 ? <p className="mb-0">No records found.</p> : (
                                    <div className="list-group mb-0">
                                        {records.map(r => (
                                            <div className="list-group-item" key={r.id}>
                                                <div className="d-flex w-100 justify-content-between align-items-start">
                                                    <div style={{ flex: 1 }}>
                                                        <h5 className="mb-2">🏥 {r.hospitalName}</h5>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <small><strong>👨‍⚕️ Doctor:</strong> {r.doctorName}</small>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <small><strong>📅 Date & Time:</strong> {new Date(r.date).toLocaleString()}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {r.pdfPath && (
                                                        <a href={`http://localhost:5099${r.pdfPath}`} target="_blank" className="btn btn-sm btn-outline-primary">View Report</a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card mt-4 shadow-sm border border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h4 className="mb-0">Doctor Consultations</h4>
                                        <small className="text-muted">Downloadable consultation reports</small>
                                    </div>
                                    <span className="badge bg-primary">{consultations.length}</span>
                                </div>
                                {consultations.length === 0 ? <p className="mb-0">No consultations yet.</p> : (
                                    <div className="list-group mb-0">
                                        {consultations.map(c => (
                                            <div className="list-group-item" key={c.id}>
                                                <div className="d-flex w-100 justify-content-between align-items-center">
                                                    <div>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-file-pdf" style={{ marginRight: '10px', fontSize: '1.5em', color: '#dc3545' }}></i>
                                                            <div>
                                                                <h6 className="mb-0">📋 Consultation Report</h6>
                                                                <small className="text-muted">{new Date(c.date).toLocaleString()}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
                                                            if (c.pdfPath) {
                                                                const link = document.createElement('a');
                                                                link.href = `${base}${c.pdfPath}`;
                                                                link.target = '_blank';
                                                                link.rel = 'noopener';
                                                                link.download = `consultation_${c.id}.pdf`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                                return;
                                                            }

                                                            const report = `CONSULTATION REPORT\n=====================================\nDate: ${new Date(c.date).toLocaleString()}\n\nVITAL SIGNS\n=====================================\nBlood Pressure: ${c.bp || 'N/A'}\nSugar Level: ${c.sugar || 'N/A'}\nTemperature: ${c.temperature || 'N/A'}°C\n\nDIAGNOSIS\n=====================================\n${c.diagnosis || 'N/A'}\n\nMEDICINES\n=====================================\n${c.medicines || 'N/A'}\n\n=====================================`;
                                                            const element = document.createElement('a');
                                                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
                                                            element.setAttribute('download', `consultation_${c.id}_${new Date(c.date).getTime()}.txt`);
                                                            element.style.display = 'none';
                                                            document.body.appendChild(element);
                                                            element.click();
                                                            document.body.removeChild(element);
                                                        }}
                                                    >
                                                        📥 Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card mt-4 shadow-sm border border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h4 className="mb-0">Medical Files & Reports</h4>
                                        <small className="text-muted">All uploaded files and reports</small>
                                    </div>
                                    <span className="badge bg-primary">{medicalFiles.length}</span>
                                </div>
                                {medicalFiles.length === 0 ? <p className="mb-0">No files uploaded yet.</p> : (
                                    <div className="list-group mb-0">
                                        {medicalFiles.map(f => (
                                            <div className="list-group-item" key={f.id}>
                                                <div className="d-flex w-100 justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="mb-1">{f.fileType}: {f.fileName}</h6>
                                                        <small className="text-muted">Uploaded: {new Date(f.uploadedAt).toLocaleDateString()} | Size: {(f.fileSize / 1024).toFixed(2)} KB</small>
                                                    </div>
                                                    <a href={`http://localhost:5099${f.filePath}`} download className="btn btn-sm btn-outline-success">Download</a>
                                                </div>
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
