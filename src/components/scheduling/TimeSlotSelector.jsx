/**
 * Time Slot Selector Component
 * Displays available time slots for a selected clinician
 */

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Group slots by date
 */
function groupSlotsByDate(slots) {
  const grouped = {};
  
  slots.forEach((slot) => {
    const dateKey = slot.startTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: slot.startTime,
        dateKey,
        slots: [],
      };
    }
    
    grouped[dateKey].slots.push(slot);
  });
  
  return Object.values(grouped).sort((a, b) => a.date - b.date);
}

/**
 * Format time slot
 */
function formatTimeSlot(slot) {
  const startTime = slot.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  const endTime = slot.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  return `${startTime} - ${endTime}`;
}

/**
 * TimeSlotSelector Component
 * @param {Object} props
 * @param {Array} props.slots - Array of available time slots
 * @param {Object} props.selectedSlot - Currently selected slot
 * @param {Function} props.onSelectSlot - Callback when slot is selected
 * @param {boolean} props.loading - Loading state
 */
export function TimeSlotSelector({ slots = [], selectedSlot, onSelectSlot, loading = false }) {
  const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Available Times
          </CardTitle>
          <CardDescription>Loading available time slots...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Available Times
          </CardTitle>
          <CardDescription>No available time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No available appointments at this time. Please check back later or select a different clinician.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Available Times
        </CardTitle>
        <CardDescription>
          Select a date and time for your appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedSlots.map((group) => (
          <div key={group.dateKey}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{group.dateKey}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {group.slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <Button
                    key={slot.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onSelectSlot(slot)}
                    className={cn(
                      "flex items-center justify-center gap-2",
                      isSelected && "ring-2 ring-primary/20"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTimeSlot(slot)}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

