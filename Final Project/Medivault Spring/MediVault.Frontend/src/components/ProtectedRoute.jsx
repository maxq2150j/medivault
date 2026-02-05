import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('role');

    if (!token) return <Navigate to="/login" />;
    if (role && userRole && userRole.toLowerCase() !== role.toLowerCase()) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
