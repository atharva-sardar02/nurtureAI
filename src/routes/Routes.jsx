/**
 * Application Routes
 * Defines all routes for the application
 */

import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { LandingPage } from '@/pages/LandingPage';
import { Landing } from '@/pages/Landing';
import { AssessmentPage } from '@/pages/Assessment';
import { OnboardingPage } from '@/pages/Onboarding';
import Scheduling from '@/pages/Scheduling';
import Confirmation from '@/pages/Confirmation';
import { SupportPage } from '@/pages/Support';
import { SupportDashboardPage } from '@/pages/SupportDashboard';
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
          <Route path="/landing" element={<Landing />} />
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
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduling"
            element={
              <ProtectedRoute>
                <Scheduling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation/:appointmentId"
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/dashboard"
            element={
              <ProtectedRoute>
                <SupportDashboardPage />
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

