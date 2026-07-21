import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gate for admin routes. Redirects to the login page when there is no
// authenticated user, so /admin/* can't be opened directly by URL.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
