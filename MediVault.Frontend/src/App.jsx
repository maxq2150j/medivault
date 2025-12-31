import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import RegisterPatient from './pages/RegisterPatient';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="container-fluid p-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPatient />} />

        {/* Dashboards */}
        <Route path="/patient/*" element={<ProtectedRoute role="Patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/hospital/*" element={<ProtectedRoute role="Hospital"><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doctor/*" element={<ProtectedRoute role="Doctor"><DoctorDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
