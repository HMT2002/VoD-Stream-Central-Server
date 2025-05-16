import { useAuth } from '../../contexts/auth-context';
import { Navigate } from 'react-router-dom';

export const RequireRole = ({ children, roles }) => {
  const auth = useAuth();
  if (!auth.isAuthorized) {
    return <Navigate to="/login" />;
  }
  if (!roles.includes(auth.role)) {
    return <Navigate to="/401/unauthorized" />;
  }
  return children;
};
