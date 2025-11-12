/**
 * Scheduling Calendar Component
 * Main component for scheduling appointments with clinicians
 */

import { useState, useEffect } from "react"
import { useScheduling } from "@/hooks/useSchedulingNew"
import { ClinicianCard } from "./ClinicianCard"
import { TimeSlotSelector } from "./TimeSlotSelector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { Calendar, AlertCircle, CheckCircle2, Clock, User, X } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import { Badge } from "@/components/ui/badge"

export function SchedulingCalendar() {
  const navigate = useNavigate();
  const {
    clinicians,
    selectedClinician,
    selectedSlot,
    loading,
    error,
    patientData,
    existingAppointments,
    activeAppointment,
    appointmentsWithClinicians,
    searchClinicians,
    selectClinician,
    selectSlot,
    bookAppointment,
    cancelExistingAppointment,
  } = useScheduling();

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Load clinicians on mount
  useEffect(() => {
    if (patientData) {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      searchClinicians(startDate, endDate);
    }
  }, [patientData, searchClinicians]);

  // Get available slots for selected clinician
  const availableSlots = selectedClinician?.availableSlots || [];

  const handleBookAppointment = async () => {
    if (!selectedClinician || !selectedSlot) {
      setBookingError("Please select a clinician and time slot");
      return;
    }

    if (activeAppointment) {
      setBookingError("You already have an active appointment. Please cancel it before booking a new one.");
      return;
    }

    setBooking(true);
    setBookingError(null);

    try {
      const result = await bookAppointment();
      if (result.success) {
        // Navigate to confirmation page
        navigate(`/confirmation/${result.appointmentId}`);
      } else {
        setBookingError(result.error || "Failed to book appointment");
      }
    } catch (err) {
      setBookingError(err.message || "An error occurred");
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelExistingAppointment(appointmentId);
      if (!result.success) {
        setBookingError(result.error || "Failed to cancel appointment");
      }
    } catch (err) {
      setBookingError(err.message || "An error occurred");
    } finally {
      setCancelling(false);
    }
  };

  const formatAppointmentDate = (dateTime) => {
    if (!dateTime) return 'Date TBD';
    const date = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAppointmentTime = (dateTime) => {
    if (!dateTime) return 'Time TBD';
    const date = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'confirmed':
      case 'scheduled':
        return 'default';
      case 'cancelled':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading && clinicians.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner fullPage message="Loading available clinicians..." />
        </div>
      </div>
    );
  }

  if (error && clinicians.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete your onboarding application before scheduling an appointment.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            {activeAppointment ? 'Your Appointments' : 'Schedule Your Appointment'}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {activeAppointment 
              ? 'Manage your appointments and schedule new ones'
              : 'Select a clinician and time that works best for your family'}
          </p>
        </div>

        {/* Active Appointment Alert */}
        {activeAppointment && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1">You have an active appointment</p>
                <p className="text-sm">
                  Please complete or cancel your current appointment before booking a new one.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Appointments Section */}
        {(appointmentsWithClinicians.length > 0 || existingAppointments.length > 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Your Appointments</h2>
            <div className="space-y-4">
              {(appointmentsWithClinicians.length > 0 ? appointmentsWithClinicians : existingAppointments).map((appointment) => {
                // Use clinician name if available, otherwise use clinicianId
                const clinicianName = appointment.clinicianName || 'Clinician';
                const isActive = appointment.id === activeAppointment?.id;
                const isPast = appointment.dateTime && 
                  (appointment.dateTime.toDate ? appointment.dateTime.toDate() : new Date(appointment.dateTime)) < new Date();
                
                return (
                  <Card 
                    key={appointment.id} 
                    className={isActive ? "border-primary shadow-md" : ""}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Appointment Details
                          </CardTitle>
                          <CardDescription>
                            {formatAppointmentDate(appointment.dateTime)} at {formatAppointmentTime(appointment.dateTime)}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status || 'pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold">Clinician</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.clinicianName || 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold">Status</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {appointment.status || 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {isActive && !isPast && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={cancelling}
                            className="w-full sm:w-auto"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {cancelling ? "Cancelling..." : "Cancel Appointment"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(error || bookingError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || bookingError}</AlertDescription>
          </Alert>
        )}

        {/* Clinician Selection - Only show if no active appointment */}
        {!activeAppointment && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Available Clinicians</h2>
          {clinicians.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <EmptyState
                  title="No Clinicians Available"
                  description="We're currently working on matching you with the right clinician. Please check back later or contact support for assistance."
                  icon={Calendar}
                  variant="illustrated"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicians.map((clinician) => (
                <ClinicianCard
                  key={clinician.id}
                  clinician={clinician}
                  selected={selectedClinician?.id === clinician.id}
                  onSelect={selectClinician}
                />
              ))}
            </div>
          )}
          </div>
        )}

        {/* Instructions - Only show if no active appointment */}
        {!activeAppointment && !selectedClinician && clinicians.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">How to Schedule</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Select a clinician from the list above</li>
                    <li>Choose an available time slot</li>
                    <li>Click "Confirm Appointment" to book</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Slot Selection - Only show if no active appointment */}
        {!activeAppointment && selectedClinician && (
          <div className="mb-8">
            <TimeSlotSelector
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={selectSlot}
              loading={loading}
            />
            {!selectedSlot && availableSlots.length > 0 && (
              <Card className="mt-4 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next step:</strong> Select a time slot above to continue booking your appointment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Booking Confirmation - Only show if no active appointment */}
        {!activeAppointment && selectedClinician && selectedSlot && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Confirm Appointment
              </CardTitle>
              <CardDescription>
                Review your appointment details before confirming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Clinician:</span>
                  <span>{selectedClinician.name || selectedClinician.displayName || 'Selected Clinician'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Date & Time:</span>
                  <span>
                    {selectedSlot.startTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {selectedSlot.startTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleBookAppointment}
                disabled={booking || activeAppointment}
                size="lg"
              >
                {booking ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

