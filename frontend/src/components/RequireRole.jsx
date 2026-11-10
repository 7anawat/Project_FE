import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function RequireRole({ role, children }) {
  const { isLoggedIn, member } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (member?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default RequireRole;

