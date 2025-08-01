import React, { useState } from 'react';
import { SchoolAssignment } from '@/entities/SchoolAssignment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SchoolAssignments({ assignments, courses, refreshAssignments, loading, activeSemester }) {
  const [showDialog, setShowDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course_id: '',
    due_date: '',
    notes: ''
  });

  const createAssignment = async () => {
    if (!newAssignment.title || !newAssignment.course_id || !newAssignment.due_date) {
      alert("Please fill in all required fields.");
      return;
    }
    
    try {
      await SchoolAssignment.create(newAssignment);
      setNewAssignment({ title: '', course_id: '', due_date: '', notes: '' });
      setShowDialog(false);
      refreshAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const toggleComplete = async (assignment) => {
    try {
      await SchoolAssignment.update(assignment.id, { completed: !assignment.completed });
      refreshAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  if (!activeSemester) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Semester</h3>
          <p className="text-gray-600">Please create and activate a semester in the Setup tab to manage assignments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2"/>Add Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Assignment Title</Label><Input value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} placeholder="e.g., Essay on Psychology"/></div>
              <div>
                <Label>Course</Label>
                <Select value={newAssignment.course_id} onValueChange={value => setNewAssignment({...newAssignment, course_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select course"/></SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})}/></div>
              <div><Label>Notes</Label><Textarea value={newAssignment.notes} onChange={e => setNewAssignment({...newAssignment, notes: e.target.value})} placeholder="Additional notes..."/></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={createAssignment}>Create Assignment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600">Add your first assignment to get started!</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.course_id);
            const isOverdue = !assignment.completed && new Date(assignment.due_date) < new Date();
            
            return (
              <Card key={assignment.id} className={assignment.completed ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={assignment.completed}
                      onCheckedChange={() => toggleComplete(assignment)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${assignment.completed ? 'line-through text-gray-500' : ''}`}>
                        {assignment.title}
                      </h4>
                      <p className="text-sm text-gray-600">{course?.name || 'Unknown Course'}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Calendar className="w-4 h-4"/>
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {assignment.notes && (
                        <p className="text-sm text-gray-600 mt-2">{assignment.notes}</p>
                      )}
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
}