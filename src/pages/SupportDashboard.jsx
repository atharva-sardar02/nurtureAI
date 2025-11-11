/**
 * Support Dashboard Page
 * Admin page for support team to manage chats
 */

import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SupportTeamDashboard } from '@/components/support/SupportTeamDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function SupportDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // TODO: Add role-based access control to check if user is support team member
  // For now, allow any authenticated user to access

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SupportTeamDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}

