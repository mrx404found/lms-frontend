import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !user.token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default PrivateRoute; 