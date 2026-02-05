import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalHospitals: 0, totalPatients: 0, totalVisits: 0, recentVisits: [] });
    const [hospitals, setHospitals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newHospital, setNewHospital] = useState({ name: '', address: '', username: '', password: '', email: '' });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchStats();
        fetchHospitals();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchHospitals = async () => {
        try {
            const res = await api.get('/admin/hospitals');
            setHospitals(res.data);
        } catch (err) { console.error(err); }
    };

    const validateHospitalForm = (form) => {
        const errors = {};

        const usernameRegex = /^[A-Za-z][A-Za-z0-9]*$/;
        if (!form.username || !usernameRegex.test(form.username)) {
            errors.username = 'Username must start with a letter and contain only letters and digits';
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!form.password || !passwordRegex.test(form.password)) {
            errors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
        }

        const emailDomainRegex = /@(gmail\.com|yahoo\.in|outlook\.com)$/i;
        if (!form.email) {
            errors.email = 'Email is required';
        } else if (!emailDomainRegex.test(form.email)) {
            errors.email = 'Email must be gmail.com, yahoo.in, or outlook.com';
        }

        const nameRegex = /^[A-Za-z ]+$/;
        if (!form.name || !nameRegex.test(form.name)) {
            errors.name = 'Hospital name can contain only letters and spaces';
        }

        if (!form.address) {
            errors.address = 'Address is required';
        }

        return errors;
    };

    const handleAddHospital = async (e) => {
        e.preventDefault();
        try {
            const errors = validateHospitalForm(newHospital);
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            console.log('[AdminDashboard] Adding hospital:', newHospital);
            await api.post('/admin/hospitals', newHospital);
            toast.success('Hospital added successfully!');
            setShowModal(false);
            setNewHospital({ name: '', address: '', username: '', password: '', email: '' });
            fetchHospitals();
            fetchStats();
        } catch (err) {
            const resp = err.response;
            console.error('[AdminDashboard] Error status:', resp?.status);
            console.error('[AdminDashboard] Error headers:', resp?.headers);
            console.error('[AdminDashboard] Error data:', resp?.data);
            console.error('[AdminDashboard] Error message:', err.message);

            const data = resp?.data;
            if (resp?.status === 400 && data?.errors) {
                const mapped = Object.fromEntries(
                    Object.entries(data.errors).map(([k, v]) => [k.toLowerCase(), v])
                );
                setFormErrors(prev => ({ ...prev, ...mapped }));
                toast.error('Validation errors. Please check the form.');
            } else {
                const msg = data?.message || err.message || 'Unknown error';
                toast.error('Failed to add hospital: ' + msg);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.put(`/admin/hospitals/${id}/toggle-status`);
            toast.success(res.data.message);
            fetchHospitals();
        } catch (err) {
            console.error('[AdminDashboard] Toggle status error:', err);
            toast.error('Failed to update hospital status');
        }
    };

    return (
        <div className="admin-dashboard">
            <ToastContainer position="top-right" autoClose={3000} />
            <Navbar />
            <div className="container mt-4 admin-dashboard-container">

                <div className="admin-dashboard-hero d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="dashboard-title mb-1">Admin Control Center</h1>
                        <p className="dashboard-subtitle mb-0">
                            Monitor platform usage, manage hospitals, and keep MediVault secure.
                        </p>
                    </div>
                    <div className="text-end d-none d-md-block">
                        <span className="badge bg-primary me-2">Hospitals {stats.totalHospitals}</span>
                        <span className="badge bg-success me-2">Patients {stats.totalPatients}</span>
                        <span className="badge bg-warning text-dark">Consultations {stats.totalVisits}</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="card stats-card stats-hospitals">
                                    <div className="card-body">
                                        <div className="stats-label">Total Hospitals</div>
                                        <div className="stats-value">{stats.totalHospitals}</div>
                                        <small className="text-muted">Onboarded organizations</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card stats-card stats-patients">
                                    <div className="card-body">
                                        <div className="stats-label">Total Patients</div>
                                        <div className="stats-value">{stats.totalPatients}</div>
                                        <small className="text-muted">Registered on MediVault</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card stats-card stats-visits">
                                    <div className="card-body">
                                        <div className="stats-label">Total Consultations</div>
                                        <div className="stats-value">{stats.totalVisits}</div>
                                        <small className="text-muted">Completed visits</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hospitals Table */}
                <div className="card admin-table-card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h4 className="mb-0">Registered Hospitals</h4>
                                <small className="text-muted">Activate or deactivate access for hospitals</small>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Hospital</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Address</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hospitals.map(h => (
                                        <tr key={h.id}>
                                            <td>{h.id}</td>
                                            <td>{h.name}</td>
                                            <td>{h.address}</td>
                                            <td>{h.username}</td>
                                            <td>{h.email}</td>
                                            <td>
                                                <span className={`badge ${h.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {h.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${h.isActive ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => handleToggleStatus(h.id)}
                                                >
                                                    {h.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add Hospital Modal */}
                {showModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Hospital</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleAddHospital}>
                                        <div className="mb-2">
                                            <input
                                                className="form-control"
                                                placeholder="Hospital Name"
                                                value={newHospital.name}
                                                onChange={e => setNewHospital({ ...newHospital, name: e.target.value })}
                                            />
                                            {formErrors.name && <div className="text-danger small">{formErrors.name}</div>}
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                className="form-control"
                                                placeholder="Address"
                                                value={newHospital.address}
                                                onChange={e => setNewHospital({ ...newHospital, address: e.target.value })}
                                            />
                                            {formErrors.address && <div className="text-danger small">{formErrors.address}</div>}
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                className="form-control"
                                                placeholder="Username"
                                                value={newHospital.username}
                                                onChange={e => setNewHospital({ ...newHospital, username: e.target.value })}
                                            />
                                            {formErrors.username && <div className="text-danger small">{Array.isArray(formErrors.username) ? formErrors.username[0] : formErrors.username}</div>}
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                className="form-control"
                                                placeholder="Email"
                                                type="email"
                                                value={newHospital.email}
                                                onChange={e => setNewHospital({ ...newHospital, email: e.target.value })}
                                            />
                                            {formErrors.email && <div className="text-danger small">{Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}</div>}
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                className="form-control"
                                                placeholder="Password"
                                                type="password"
                                                value={newHospital.password}
                                                onChange={e => setNewHospital({ ...newHospital, password: e.target.value })}
                                            />
                                            {formErrors.password && <div className="text-danger small">{formErrors.password}</div>}
                                        </div>
                                        <button className="btn btn-success w-100 mt-2">Save</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
