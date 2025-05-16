import { useAuth } from '../../contexts/auth-context';
import { Navigate } from 'react-router-dom';

export const RequireAuth = ({ children }) => {
  const auth = useAuth();
  if (!auth.isAuthorized) {
    return <Navigate to="/login" />;
  }
  return children;
};
