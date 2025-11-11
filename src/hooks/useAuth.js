/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 * Re-exports useAuth from AuthContext for consistency
 */

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Auth context value with user, loading, and auth methods
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;

