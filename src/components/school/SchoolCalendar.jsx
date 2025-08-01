import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';

export default function SchoolCalendar({ assignments, courses, activeSemester, loading }) {
  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  if (!activeSemester) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Semester</h3>
          <p className="text-gray-600">Please create and activate a semester in the Setup tab to view the calendar.</p>
        </CardContent>
      </Card>
    );
  }

  const upcomingAssignments = assignments
    .filter(a => !a.completed && new Date(a.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 10);

  const getDateLabel = (date) => {
    const assignmentDate = parseISO(date);
    if (isToday(assignmentDate)) return 'Today';
    if (isTomorrow(assignmentDate)) return 'Tomorrow';
    return format(assignmentDate, 'MMM d, yyyy');
  };

  const getDateColor = (date) => {
    const assignmentDate = parseISO(date);
    const daysUntil = Math.ceil((assignmentDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 1) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntil <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (daysUntil <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5"/>
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming assignments!</p>
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map(assignment => {
                const course = courses.find(c => c.id === assignment.course_id);
                return (
                  <div key={assignment.id} className={`p-4 border rounded-lg ${getDateColor(assignment.due_date)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <p className="text-sm opacity-75">{course?.name || 'Unknown Course'}</p>
                        {assignment.notes && (
                          <p className="text-sm mt-1 opacity-75">{assignment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{getDateLabel(assignment.due_date)}</div>
                        <div className="text-sm opacity-75 flex items-center gap-1">
                          <Clock className="w-3 h-3"/>
                          {format(parseISO(assignment.due_date), 'MMM d')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}