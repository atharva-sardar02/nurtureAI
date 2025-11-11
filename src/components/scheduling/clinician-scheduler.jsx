import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function ClinicianScheduler() {
  const [selectedClinician, setSelectedClinician] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const clinicians = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      title: "Child Psychologist",
      specialty: "Anxiety & Depression",
      acceptedInsurance: ["United Healthcare", "Aetna", "Anthem Blue Cross"],
      photo: "/professional-woman-therapist.png",
      bio: "Specializes in adolescent mental health with 8+ years experience",
      rating: 4.9,
    },
    {
      id: "2",
      name: "Dr. Michael Rodriguez",
      title: "Licensed Therapist",
      specialty: "ADHD & Behavioral",
      acceptedInsurance: ["Molina Healthcare", "Cigna", "United Healthcare"],
      photo: "/professional-man-therapist.png",
      bio: "Expert in behavioral interventions for children and teens",
      rating: 4.8,
    },
    {
      id: "3",
      name: "Dr. Emily Walsh",
      title: "Clinical Social Worker",
      specialty: "Family Therapy",
      acceptedInsurance: ["Anthem Blue Cross", "Molina Healthcare", "Cigna"],
      photo: "/professional-woman-counselor.png",
      bio: "Focuses on family dynamics and improving relationships",
      rating: 4.7,
    },
  ]

  const timeSlots = [
    { id: "1", time: "9:00 AM", available: true },
    { id: "2", time: "10:00 AM", available: true },
    { id: "3", time: "11:00 AM", available: false },
    { id: "4", time: "2:00 PM", available: true },
    { id: "5", time: "3:00 PM", available: true },
    { id: "6", time: "4:00 PM", available: false },
  ]

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Schedule Your First Appointment</h1>
          <p className="text-lg text-muted-foreground">Select a clinician and time that works best for your family</p>
        </div>

        {/* Clinician Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Meet Our Clinicians</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {clinicians.map((clinician) => (
              <Card
                key={clinician.id}
                className={cn(
                  "border transition-all cursor-pointer hover:shadow-lg",
                  selectedClinician?.id === clinician.id
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border",
                )}
                onClick={() => setSelectedClinician(clinician)}
              >
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <img
                      src={clinician.photo || "/placeholder.svg"}
                      alt={clinician.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-lg">{clinician.name}</h3>
                    <p className="text-sm text-primary font-medium">{clinician.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{clinician.specialty}</p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 text-center">{clinician.bio}</p>

                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{clinician.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Accepted Insurance:</p>
                    <div className="flex flex-wrap gap-2">
                      {clinician.acceptedInsurance.map((insurance) => (
                        <span
                          key={insurance}
                          className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded"
                        >
                          {insurance}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" variant={selectedClinician?.id === clinician.id ? "default" : "outline"}>
                    {selectedClinician?.id === clinician.id ? "Selected" : "Select Clinician"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        {selectedClinician && (
          <Card className="border border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Next available appointments for {selectedClinician.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Date</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["Dec 15", "Dec 16", "Dec 17", "Dec 18", "Dec 19", "Dec 22", "Dec 23", "Dec 24"].map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className="w-full"
                    >
                      {date}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-3">Select Time</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className="flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {selectedDate && selectedTime && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>Appointment Confirmed:</strong> {selectedClinician.name} on {selectedDate} at {selectedTime}
                  </p>
                </div>
              )}

              <Button className="w-full bg-primary hover:bg-primary/90" disabled={!selectedDate || !selectedTime}>
                Confirm Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

