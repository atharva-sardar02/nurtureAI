/**
 * Support Page
 * Page for users to access support chat
 */

import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SupportChat } from '@/components/support/SupportChat';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function SupportPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SupportChat />
        </div>
      </main>
      <Footer />
    </div>
  );
}

