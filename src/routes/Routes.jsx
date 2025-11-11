/**
 * Application Routes
 * Defines all routes for the application
 */

import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { LandingPage } from '@/pages/LandingPage';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Main Routes component
 * Sets up React Router with protected routes
 */
export function Routes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </RouterRoutes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Routes;

