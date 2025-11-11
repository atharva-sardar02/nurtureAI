/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner text="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

