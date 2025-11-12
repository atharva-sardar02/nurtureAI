/**
 * Appointment Confirmation Component
 * Displays appointment confirmation details
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAppointment } from "@/services/scheduling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { CheckCircle2, Calendar, Clock, User, AlertCircle, Download } from "lucide-react"
import { formatDate, formatTime } from "@/utils/dateHelpers"

export function AppointmentConfirmation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [clinician, setClinician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointmentData();
  }, [appointmentId]);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get appointment
      const appointmentResult = await getAppointment(appointmentId);
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.error || "Appointment not found");
      }

      const appointmentData = appointmentResult.data;
      setAppointment(appointmentData);

      // Get clinician details (using dynamic import to avoid circular dependency)
      if (appointmentData.clinicianId) {
        const { getClinicianById } = await import('@/services/scheduling');
        const clinicianData = await getClinicianById(appointmentData.clinicianId);
        setClinician(clinicianData);
      }
    } catch (err) {
      console.error("Error loading appointment:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!appointment || !appointment.dateTime) return;

    const startDate = appointment.dateTime.toDate
      ? appointment.dateTime.toDate()
      : new Date(appointment.dateTime);
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour appointment

    // Format dates for calendar (YYYYMMDDTHHmmss)
    const formatCalendarDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment with ${clinician?.name || 'Clinician'}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}&details=Your appointment with Daybreak Health`;

    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading appointment details..." />;
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Appointment not found"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/scheduling")} className="mt-4">
            Back to Scheduling
          </Button>
        </div>
      </div>
    );
  }

  const appointmentDate = appointment.dateTime?.toDate
    ? appointment.dateTime.toDate()
    : new Date(appointment.dateTime);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Appointment Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Your appointment has been successfully scheduled
          </p>
        </div>

        {/* Appointment Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Save these details for your records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Clinician */}
            {clinician && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Clinician</p>
                  <p className="text-base">
                    {clinician.name || clinician.displayName || clinician.profileData?.name || 'Clinician'}
                  </p>
                  {clinician.title && (
                    <p className="text-sm text-muted-foreground">{clinician.title}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Date</p>
                <p className="text-base">{formatDate(appointmentDate)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Time</p>
                <p className="text-base">{formatTime(appointmentDate)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Status</p>
                <p className="text-base capitalize">{appointment.status || 'Pending'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Add to Google Calendar
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="w-full"
            size="lg"
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Help Text */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You will receive a confirmation email shortly. If you need to reschedule or cancel,
            please contact support at least 24 hours before your appointment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

