import React, { useState } from 'react';
import { StudyLog } from '@/entities/StudyLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function SchoolStudyTracker({ courses, studyLogs, refreshStudyLogs, loading, activeSemester }) {
  const [showDialog, setShowDialog] = useState(false);
  const [newLog, setNewLog] = useState({
    course_id: '',
    duration_minutes: '',
    topic: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const createStudyLog = async () => {
    if (!newLog.course_id || !newLog.duration_minutes) {
      alert("Please fill in required fields.");
      return;
    }
    
    try {
      await StudyLog.create({
        ...newLog,
        duration_minutes: parseInt(newLog.duration_minutes)
      });
      setNewLog({
        course_id: '',
        duration_minutes: '',
        topic: '',
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setShowDialog(false);
      refreshStudyLogs();
    } catch (error) {
      console.error("Error creating study log:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading study tracker...</div>;
  }

  if (!activeSemester) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Semester</h3>
          <p className="text-gray-600">Please create and activate a semester in the Setup tab to track study time.</p>
        </CardContent>
      </Card>
    );
  }

  const totalStudyTime = studyLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
  const studyHours = Math.floor(totalStudyTime / 60);
  const studyMinutes = totalStudyTime % 60;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2"/>
            <div className="text-2xl font-bold">{studyHours}h {studyMinutes}m</div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2"/>
            <div className="text-2xl font-bold">{studyLogs.length}</div>
            <div className="text-sm text-gray-600">Study Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2"/>
            <div className="text-2xl font-bold">
              {studyLogs.length > 0 ? Math.round(totalStudyTime / studyLogs.length) : 0}m
            </div>
            <div className="text-sm text-gray-600">Avg Session</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Study Sessions</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2"/>Log Study Time</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Study Session</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Course</Label>
                <Select value={newLog.course_id} onValueChange={value => setNewLog({...newLog, course_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select course"/></SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Duration (minutes)</Label><Input type="number" value={newLog.duration_minutes} onChange={e => setNewLog({...newLog, duration_minutes: e.target.value})} placeholder="e.g., 60"/></div>
              <div><Label>Topic/Subject</Label><Input value={newLog.topic} onChange={e => setNewLog({...newLog, topic: e.target.value})} placeholder="What did you study?"/></div>
              <div><Label>Date</Label><Input type="date" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})}/></div>
              <div><Label>Notes</Label><Textarea value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} placeholder="How did the session go?"/></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={createStudyLog}>Log Session</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {studyLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Study Sessions</h3>
              <p className="text-gray-600">Start logging your study time to track your progress!</p>
            </CardContent>
          </Card>
        ) : (
          studyLogs
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(log => {
              const course = courses.find(c => c.id === log.course_id);
              return (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{log.topic || 'Study Session'}</h4>
                        <p className="text-sm text-gray-600">{course?.name || 'Unknown Course'}</p>
                        {log.notes && <p className="text-sm text-gray-600 mt-1">{log.notes}</p>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{log.duration_minutes} minutes</div>
                        <div className="text-sm text-gray-500">{format(new Date(log.date), 'MMM d, yyyy')}</div>
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