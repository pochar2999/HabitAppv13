
import React, { useState, useEffect } from "react";
import { CalendarEvent } from "@/entities/CalendarEvent";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Eye,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays, // Added subDays for consistency
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn,
  eachDayOfInterval, // New import
  isWithinInterval, // New import
  add, // New import
  sub // New import
} from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const eventColors = {
  blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  pink: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  gray: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" }
};

const categories = ["Birthday", "To-do", "Meeting", "Appointment", "Holiday", "Other"];

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Retained but less critical with newEvent initialization
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
    color: "blue",
    category: "To-do", // New field
    is_recurring: false,
    recurring_type: "weekly",
    recurring_until: "",
    reminder_enabled: false,
    reminder_time: 15
  });
  const [expandedEvents, setExpandedEvents] = useState([]); // New state for recurring occurrences

  useEffect(() => {
    loadData();
  }, []);

  // Effect to generate and update expanded events when base events, current date, or view changes
  useEffect(() => {
    if (!loading) { // Only generate once data is loaded
      setExpandedEvents(generateEventsForView());
    }
  }, [events, currentDate, view, loading]);


  const generateEventsForView = () => {
    let rangeStart, rangeEnd;

    // Determine the visible date range based on the current view
    if (view === 'month') {
        rangeStart = startOfWeek(startOfMonth(currentDate));
        rangeEnd = endOfWeek(endOfMonth(currentDate));
    } else if (view === 'week') {
        rangeStart = startOfWeekFn(currentDate); // Using startOfWeekFn to avoid conflict if `startOfWeek` from different import
        rangeEnd = endOfWeekFn(currentDate);     // Using endOfWeekFn
    } else { // day view
        rangeStart = startOfDay(currentDate);
        rangeEnd = endOfDay(currentDate);
    }

    const allOccurrences = [];

    events.forEach(event => {
        const eventStart = new Date(event.start_date);
        // Ensure eventEnd is a Date object, defaulting to eventStart if no end_date
        const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;

        if (event.is_recurring) {
            let currentOccurrenceDate = eventStart;
            // Set a sensible default for recurring_until if not provided (e.g., 1 year from the current date)
            const untilDate = event.recurring_until ? new Date(event.recurring_until) : add(new Date(), { years: 1 });

            // Calculate the duration of the original event in days
            const eventDurationDays = Math.max(0, (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));

            // Iterate until the 'untilDate' or slightly beyond the current view's end
            // This buffer helps catch recurring events that start just outside the view but span into it
            const iterationLimit = add(rangeEnd, { months: 1 }); // Look one month beyond the view end

            while (currentOccurrenceDate <= untilDate && currentOccurrenceDate <= iterationLimit) {
                // Adjust occurrence's end date relative to its current start date and original duration
                const occurrenceEnd = add(currentOccurrenceDate, { days: eventDurationDays });

                // Define the interval for the current occurrence
                const occurrenceIntervalStart = startOfDay(currentOccurrenceDate);
                const occurrenceIntervalEnd = endOfDay(occurrenceEnd);

                // Check if the current occurrence's interval overlaps with the visible range
                // An interval [A, B] overlaps with [C, D] if A <= D and B >= C
                if (occurrenceIntervalStart <= endOfDay(rangeEnd) && occurrenceIntervalEnd >= startOfDay(rangeStart)) {
                    allOccurrences.push({
                        ...event,
                        // Override start_date and end_date for this specific occurrence
                        start_date: format(currentOccurrenceDate, 'yyyy-MM-dd'),
                        end_date: format(occurrenceEnd, 'yyyy-MM-dd'),
                        original_id: event.id, // Store the original database ID
                        id: `${event.id}-${format(currentOccurrenceDate, 'yyyyMMdd')}` // Unique ID for React key prop
                    });
                }

                // Advance to the next occurrence based on recurrence type
                if (event.recurring_type === 'daily') currentOccurrenceDate = add(currentOccurrenceDate, { days: 1 });
                else if (event.recurring_type === 'weekly') currentOccurrenceDate = add(currentOccurrenceDate, { weeks: 1 });
                else if (event.recurring_type === 'monthly') currentOccurrenceDate = add(currentOccurrenceDate, { months: 1 });
                else if (event.recurring_type === 'yearly') currentOccurrenceDate = add(currentOccurrenceDate, { years: 1 });
                else break; // Should not happen for valid recurring types
            }
        } else {
            // For non-recurring events, check if their interval overlaps with the current view
            const eventIntervalStart = startOfDay(eventStart);
            const eventIntervalEnd = endOfDay(eventEnd);

            if (eventIntervalStart <= endOfDay(rangeEnd) && eventIntervalEnd >= startOfDay(rangeStart)) {
                allOccurrences.push(event);
            }
        }
    });

    // Sort all occurrences by start time for consistent display
    return allOccurrences.sort((a, b) => {
        const timeA = a.start_time || '00:00';
        const timeB = b.start_time || '00:00';
        return timeA.localeCompare(timeB);
    });
  };

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const eventData = await CalendarEvent.filter({ user_id: userData.id });
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    try {
      await CalendarEvent.create({ ...newEvent, user_id: user.id });
      setNewEvent({
        title: "",
        description: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        location: "",
        color: "blue",
        category: "To-do", // Reset category
        is_recurring: false,
        recurring_type: "weekly",
        recurring_until: "",
        reminder_enabled: false,
        reminder_time: 15
      });
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      // Use original_id for the database call if it's a recurring event occurrence
      const idToUpdate = editingEvent.original_id || editingEvent.id;
      // When updating a recurring event occurrence, we update the base event definition
      await CalendarEvent.update(idToUpdate, editingEvent);
      setEditingEvent(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventToDelete) => {
    try {
      // Use original_id for the database call if it's a recurring event occurrence
      const idToDelete = eventToDelete.original_id || eventToDelete.id;
      await CalendarEvent.delete(idToDelete);
      loadData();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const getEventsForDate = (date) => {
    const dateOnly = startOfDay(date);
    return expandedEvents.filter(event => {
      const eventStart = startOfDay(new Date(event.start_date));
      const eventEnd = endOfDay(new Date(event.end_date || event.start_date)); // Ensure end of day for interval check
      return isWithinInterval(dateOnly, { start: eventStart, end: eventEnd });
    });
  };

  // This function is less critical now as generateEventsForView handles the primary filtering for display
  // It's not actively used by renderWeekView anymore.
  const getEventsForRange = (startDate, endDate) => {
    const rangeStart = startOfDay(startDate);
    const rangeEnd = endOfDay(endDate);
    return expandedEvents.filter(event => {
      const eventStart = startOfDay(new Date(event.start_date));
      const eventEnd = endOfDay(new Date(event.end_date || event.start_date));
      // Overlap check for intervals
      return (eventStart <= rangeEnd && eventEnd >= rangeStart);
    });
  };


  const navigateDate = (direction) => {
    if (view === "month") {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else { // day
      setCurrentDate(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1));
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const rows = [];
    let days = [];

    daysInMonth.forEach((day, index) => {
        const dayEvents = getEventsForDate(day); // Use getEventsForDate which filters expandedEvents

        days.push(
          <div
            key={day.toISOString()} // Use ISO string for unique key for day divs
            className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
              !isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-400" : ""
            } ${isSameDay(day, new Date()) ? "bg-blue-50 border-blue-200" : ""}`}
            onClick={() => {
              setSelectedDate(day); // This state is not directly used in newEvent setup now
              setNewEvent({
                ...newEvent,
                start_date: format(day, "yyyy-MM-dd"),
                end_date: format(day, "yyyy-MM-dd")
              });
              setEditingEvent(null);
              setShowDialog(true);
            }}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, dateFormat)}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => {
                const colorClass = eventColors[event.color];
                return (
                  <div
                    key={event.id} // Use event.id which is unique for occurrences
                    className={`text-xs px-2 py-1 rounded truncate ${colorClass.bg} ${colorClass.text}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening new event dialog for the day
                      setEditingEvent(event); // event object now has original_id if it's recurring
                      setShowDialog(true);
                    }}
                  >
                    {event.start_time && (
                      <span className="font-medium">
                        {format(new Date(`2000-01-01T${event.start_time}`), "HH:mm")}
                      </span>
                    )} {event.title}
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );

        if ((index + 1) % 7 === 0) { // If it's the end of a week
            rows.push(
                <div key={`week-${index}`} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
    });

    // Handle any remaining days if the month doesn't end on a Saturday
    if (days.length > 0) {
        rows.push(
            <div key={`week-last`} className="grid grid-cols-7">
                {days}
            </div>
        );
    }

    return (
      <div className="space-y-0">
        <div className="grid grid-cols-7 bg-gray-100 text-gray-700 text-sm font-medium">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-4 text-center border border-gray-200">
              {day}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeekFn(currentDate);
    const weekEnd = endOfWeekFn(currentDate);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const days = [];

    daysInWeek.forEach((day, index) => {
      const dayEvents = getEventsForDate(day); // Use getEventsForDate with expandedEvents
      days.push(
        <div key={day.toISOString()} className="border border-gray-200 min-h-[300px]">
          <div className={`p-3 border-b border-gray-200 text-center font-medium ${
            isSameDay(day, new Date()) ? "bg-blue-50 text-blue-700" : "bg-gray-50"
          }`}>
            <div className="text-sm text-gray-600">
              {format(day, "EEE")}
            </div>
            <div className="text-lg">
              {format(day, "d")}
            </div>
          </div>
          <div className="p-2 space-y-1">
            {dayEvents.map(event => {
              const colorClass = eventColors[event.color];
              return (
                <div
                  key={event.id} // Use event.id which is unique for occurrences
                  className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-75 ${colorClass.bg} ${colorClass.text}`}
                  onClick={() => {
                    setEditingEvent(event); // event object now has original_id if it's recurring
                    setShowDialog(true);
                  }}
                >
                  <div className="font-medium">{event.title}</div>
                  {event.start_time && (
                    <div className="text-xs opacity-75">
                      {format(new Date(`2000-01-01T${event.start_time}`), "HH:mm")}
                    </div>
                  )}
                  {event.category && <Badge className="mt-1">{event.category}</Badge>}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

    return (
      <div className="grid grid-cols-7 gap-0">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate); // Use getEventsForDate with expandedEvents

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <p className="text-gray-600">
            {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
          </p>
        </div>

        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for this day
            </div>
          ) : (
            dayEvents.map(event => {
              const colorClass = eventColors[event.color];
              return (
                <Card key={event.id} className={`${colorClass.border} border-l-4`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {event.start_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(`2000-01-01T${event.start_time}`), "HH:mm")}
                              {event.end_time && (
                                <span> - {format(new Date(`2000-01-01T${event.end_time}`), "HH:mm")}</span>
                              )}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.category && <Badge className="mt-2">{event.category}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(event); // event object now has original_id if it's recurring
                            setShowDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event)} // Pass full event object
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const weekStart = startOfWeekFn(currentDate);
      const weekEnd = endOfWeekFn(currentDate);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM d, yyyy");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              Manage your events and schedule
            </p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingEvent(null);
                setNewEvent({
                  title: "",
                  description: "",
                  start_date: format(new Date(), "yyyy-MM-dd"),
                  start_time: "",
                  end_date: format(new Date(), "yyyy-MM-dd"),
                  end_time: "",
                  location: "",
                  color: "blue",
                  category: "To-do", // Reset category for new event
                  is_recurring: false,
                  recurring_type: "weekly",
                  recurring_until: "",
                  reminder_enabled: false,
                  reminder_time: 15
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white" // Updated button style
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingEvent ? editingEvent.title : newEvent.title}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, title: e.target.value });
                    } else {
                      setNewEvent({ ...newEvent, title: e.target.value });
                    }
                  }}
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingEvent ? editingEvent.description : newEvent.description}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, description: e.target.value });
                    } else {
                      setNewEvent({ ...newEvent, description: e.target.value });
                    }
                  }}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={editingEvent ? editingEvent.start_date : newEvent.start_date}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, start_date: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, start_date: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={editingEvent ? editingEvent.start_time : newEvent.start_time}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, start_time: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, start_time: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={editingEvent ? editingEvent.end_date : newEvent.end_date}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, end_date: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, end_date: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={editingEvent ? editingEvent.end_time : newEvent.end_time}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, end_time: e.target.value });
                    } else {
                        setNewEvent({ ...newEvent, end_time: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              {/* New Category Select */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingEvent ? editingEvent.category : newEvent.category}
                  onValueChange={(value) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, category: value });
                    } else {
                      setNewEvent({ ...newEvent, category: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editingEvent ? editingEvent.location : newEvent.location}
                  onChange={(e) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, location: e.target.value });
                    } else {
                      setNewEvent({ ...newEvent, location: e.target.value });
                    }
                  }}
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Select
                  value={editingEvent ? editingEvent.color : newEvent.color}
                  onValueChange={(value) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, color: value });
                    } else {
                      setNewEvent({ ...newEvent, color: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventColors).map(([color, classes]) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${classes.bg} ${classes.border} border`} />
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={editingEvent ? editingEvent.is_recurring : newEvent.is_recurring}
                  onCheckedChange={(checked) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, is_recurring: checked });
                    } else {
                      setNewEvent({ ...newEvent, is_recurring: checked });
                    }
                  }}
                />
                <Label htmlFor="is_recurring">Recurring Event</Label>
              </div>

              {((editingEvent && editingEvent.is_recurring) || (!editingEvent && newEvent.is_recurring)) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recurring_type">Repeat</Label>
                    <Select
                      value={editingEvent ? editingEvent.recurring_type : newEvent.recurring_type}
                      onValueChange={(value) => {
                        if (editingEvent) {
                          setEditingEvent({ ...editingEvent, recurring_type: value });
                        } else {
                          setNewEvent({ ...newEvent, recurring_type: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recurring_until">Until</Label>
                    <Input
                      id="recurring_until"
                      type="date"
                      value={editingEvent ? editingEvent.recurring_until : newEvent.recurring_until}
                      onChange={(e) => {
                        if (editingEvent) {
                          setEditingEvent({ ...editingEvent, recurring_until: e.target.value });
                        } else {
                          setNewEvent({ ...newEvent, recurring_until: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder_enabled"
                  checked={editingEvent ? editingEvent.reminder_enabled : newEvent.reminder_enabled}
                  onCheckedChange={(checked) => {
                    if (editingEvent) {
                      setEditingEvent({ ...editingEvent, reminder_enabled: checked });
                    } else {
                      setNewEvent({ ...newEvent, reminder_enabled: checked });
                    }
                  }}
                />
                <Label htmlFor="reminder_enabled">Enable Reminder</Label>
              </div>

              {((editingEvent && editingEvent.reminder_enabled) || (!editingEvent && newEvent.reminder_enabled)) && (
                <div>
                  <Label htmlFor="reminder_time">Remind me (minutes before)</Label>
                  <Select
                    value={String(editingEvent ? editingEvent.reminder_time : newEvent.reminder_time)}
                    onValueChange={(value) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, reminder_time: parseInt(value) });
                      } else {
                        setNewEvent({ ...newEvent, reminder_time: parseInt(value) });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                {editingEvent && (
                  <Button
                    onClick={() => {
                      handleDeleteEvent(editingEvent);
                      setShowDialog(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Event
                  </Button>
                )}
                <Button
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  disabled={editingEvent ? !editingEvent.title : !newEvent.title}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingEvent ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {getViewTitle()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                <List className="w-4 h-4 mr-1" />
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                <Eye className="w-4 h-4 mr-1" />
                Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-0">
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
          {view === "day" && renderDayView()}
        </CardContent>
      </Card>

      {/* Events Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Events Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div> {/* Still show total original events */}
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.is_recurring).length}
              </div>
              <div className="text-sm text-gray-600">Recurring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.filter(e => e.reminder_enabled).length}
              </div>
              <div className="text-sm text-gray-600">With Reminders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getEventsForDate(new Date()).length}
              </div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
