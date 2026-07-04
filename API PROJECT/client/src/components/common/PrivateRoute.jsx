import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
