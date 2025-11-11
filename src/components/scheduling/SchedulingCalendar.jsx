/**
 * Scheduling Calendar Component
 * Main component for scheduling appointments with clinicians
 */

import { useState, useEffect } from "react"
import { useScheduling } from "@/hooks/useScheduling"
import { ClinicianCard } from "./ClinicianCard"
import { TimeSlotSelector } from "./TimeSlotSelector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"

export function SchedulingCalendar() {
  const navigate = useNavigate();
  const {
    clinicians,
    selectedClinician,
    selectedSlot,
    loading,
    error,
    patientData,
    searchClinicians,
    selectClinician,
    selectSlot,
    bookAppointment,
  } = useScheduling();

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Schedule Your First Appointment</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Select a clinician and time that works best for your family
          </p>
        </div>

        {/* Error Alert */}
        {(error || bookingError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || bookingError}</AlertDescription>
          </Alert>
        )}

        {/* Clinician Selection */}
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

        {/* Instructions */}
        {!selectedClinician && clinicians.length > 0 && (
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

        {/* Time Slot Selection */}
        {selectedClinician && (
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

        {/* Booking Confirmation */}
        {selectedClinician && selectedSlot && (
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
                disabled={booking}
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

