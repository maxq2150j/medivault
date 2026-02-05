import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalHospitals: 0, totalPatients: 0, totalVisits: 0, recentVisits: [] });
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState('hospitals');
    const [showModal, setShowModal] = useState(false);
    const [newHospital, setNewHospital] = useState({ name: '', address: '', username: '', password: '', email: '' });

    useEffect(() => {
        fetchStats();
        fetchHospitals();
        fetchDoctors();
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

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddHospital = async (e) => {
        e.preventDefault();
        try {
            console.log('[AdminDashboard] Adding hospital:', newHospital);
            await api.post('/admin/hospitals', newHospital);
            alert('Hospital added successfully!');
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

            const msg = resp?.data
                ? (typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data, null, 2))
                : err.message || 'Unknown error';

            alert('Failed to add hospital:\n\n' + msg);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.put(`/admin/hospitals/${id}/toggle-status`);
            alert(res.data.message || res.data.Message);
            fetchHospitals();
        } catch (err) {
            console.error('[AdminDashboard] Toggle status error:', err);
            alert('Failed to update hospital status');
        }
    };

    const handleToggleDoctorStatus = async (id) => {
        try {
            const res = await api.put(`/admin/doctors/${id}/toggle-status`);
            alert(res.data.Message);
            fetchDoctors();
        } catch (err) {
            console.error('[AdminDashboard] Toggle doctor status error:', err);
            alert('Failed to update doctor status');
        }
    };

    return (
        <div className="admin-dashboard">
            <Navbar />
            <div className="container mt-4">
                <h2 className="mb-4">Admin Dashboard</h2>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card text-white bg-primary mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Total Hospitals</h5>
                                <p className="card-text display-4">{stats.totalHospitals}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-white bg-success mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Total Patients</h5>
                                <p className="card-text display-4">{stats.totalPatients}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-white bg-warning mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Total Consultations</h5>
                                <p className="card-text display-4">{stats.totalVisits}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <ul className="nav nav-tabs mt-4 mb-3">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
                            Hospitals
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
                            All Doctors
                        </button>
                    </li>
                </ul>

                {/* Hospitals Tab */}
                {activeTab === 'hospitals' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4>Registered Hospitals</h4>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Hospital</button>
                        </div>
                        <table className="table table-striped">
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
                )}

                {/* Doctors Tab */}
                {activeTab === 'doctors' && (
                    <div>
                        <h4 className="mb-3">All Doctors</h4>
                        {doctors.length === 0 ? (
                            <p className="text-muted">No doctors registered yet.</p>
                        ) : (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Specialization</th>
                                        <th>License</th>
                                        <th>Hospital</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map(d => (
                                        <tr key={d.id}>
                                            <td>{d.name}</td>
                                            <td>{d.specialization}</td>
                                            <td>{d.licenseNumber}</td>
                                            <td>{d.hospitalName}</td>
                                            <td>{d.phoneNumber}</td>
                                            <td>
                                                <span className={`badge ${d.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                    {d.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${d.isActive ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => handleToggleDoctorStatus(d.id)}
                                                >
                                                    {d.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

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
                                        <div className="mb-2"><input className="form-control" placeholder="Hospital Name" onChange={e => setNewHospital({ ...newHospital, name: e.target.value })} required /></div>
                                        <div className="mb-2"><input className="form-control" placeholder="Address" onChange={e => setNewHospital({ ...newHospital, address: e.target.value })} required /></div>
                                        <div className="mb-2"><input className="form-control" placeholder="Username" onChange={e => setNewHospital({ ...newHospital, username: e.target.value })} required /></div>
                                        <div className="mb-2"><input className="form-control" placeholder="Email" type="email" onChange={e => setNewHospital({ ...newHospital, email: e.target.value })} required /></div>
                                        <div className="mb-2"><input className="form-control" placeholder="Password" type="password" onChange={e => setNewHospital({ ...newHospital, password: e.target.value })} required /></div>
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
