/**
 * Admin Dashboard Page
 * Admin page for viewing system statistics
 */

import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // TODO: Add role-based access control to check if user is admin
  // For now, allow any authenticated user to access

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}

