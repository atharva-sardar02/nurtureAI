/**
 * Admin Dashboard Component
 * Displays statistics and metrics for administrators
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getAllAdminStats } from '@/services/admin/AdminStatsService';
import {
  MessageCircle,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

/**
 * StatCard Component
 */
function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * AdminDashboard Component
 */
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllAdminStats();
      if (result.success) {
        setStats(result.stats);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading admin statistics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system statistics and metrics
            {lastUpdated && (
              <span className="ml-2 text-xs">
                (Last updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Support Chat Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Support Chat Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.support ? (
            <>
              <StatCard
                title="Total Chats"
                value={stats.support.total}
                icon={MessageCircle}
              />
              <StatCard
                title="Active Chats"
                value={stats.support.active}
                subtitle={`${stats.support.resolved} resolved`}
                icon={MessageCircle}
                variant="warning"
              />
              <StatCard
                title="Today"
                value={stats.support.today}
                subtitle={`${stats.support.thisWeek} this week`}
                icon={Clock}
              />
              <StatCard
                title="Resolution Rate"
                value={`${stats.support.resolutionRate}%`}
                subtitle={
                  stats.support.avgResponseTimeMinutes
                    ? `Avg response: ${stats.support.avgResponseTimeMinutes} min`
                    : 'No response time data'
                }
                icon={CheckCircle2}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No support chat data available
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.users ? (
            <>
              <StatCard
                title="Total Users"
                value={stats.users.total}
                icon={Users}
              />
              <StatCard
                title="Active Assessments"
                value={stats.users.activeAssessments}
                subtitle={`${stats.users.inProgressOnboardings} onboarding in progress`}
                icon={FileText}
              />
              <StatCard
                title="Completed Onboardings"
                value={stats.users.completedOnboardings}
                icon={CheckCircle2}
              />
              <StatCard
                title="Completion Rate"
                value={`${stats.users.onboardingCompletionRate}%`}
                subtitle="Onboarding completion"
                icon={TrendingUp}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No user data available
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assessment Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Assessment Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.assessments ? (
            <>
              <StatCard
                title="Total Assessments"
                value={stats.assessments.total}
                icon={FileText}
              />
              <StatCard
                title="Completed"
                value={stats.assessments.completed}
                subtitle={`${stats.assessments.inProgress} in progress`}
                icon={CheckCircle2}
              />
              <StatCard
                title="Today"
                value={stats.assessments.today}
                subtitle={`${stats.assessments.thisWeek} this week`}
                icon={Clock}
              />
              <StatCard
                title="Completion Rate"
                value={`${stats.assessments.completionRate}%`}
                icon={TrendingUp}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No assessment data available
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assessment Suitability Breakdown */}
        {stats?.assessments && (
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Suitability Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold">Suitable</p>
                      <p className="text-sm text-muted-foreground">{stats.assessments.suitable} assessments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-semibold">Not Suitable</p>
                      <p className="text-sm text-muted-foreground">{stats.assessments.notSuitable} assessments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold">Crisis Detected</p>
                      <p className="text-sm text-muted-foreground">{stats.assessments.crisis} assessments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Appointment Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Appointment Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.appointments ? (
            <>
              <StatCard
                title="Total Appointments"
                value={stats.appointments.total}
                icon={Calendar}
              />
              <StatCard
                title="Scheduled"
                value={stats.appointments.scheduled}
                subtitle={`${stats.appointments.completed} completed, ${stats.appointments.cancelled} cancelled`}
                icon={Clock}
              />
              <StatCard
                title="Today"
                value={stats.appointments.today}
                subtitle={`${stats.appointments.thisWeek} this week`}
                icon={Calendar}
              />
              <StatCard
                title="Completion Rate"
                value={`${stats.appointments.completionRate}%`}
                icon={TrendingUp}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No appointment data available
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

