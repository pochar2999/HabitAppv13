import React, { useState } from 'react';
import { Semester } from '@/entities/Semester';
import { Course } from '@/entities/Course';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

export default function SchoolSetup({ user, semesters, courses, activeSemester, refreshData, setActiveSemester }) {
  const [showSemesterDialog, setShowSemesterDialog] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [newSemester, setNewSemester] = useState({ name: '', start_date: '', end_date: '' });
  const [newCourse, setNewCourse] = useState({ name: '', code: '', credits: 3, instructor: '' });

  const createSemester = async () => {
    try {
      await Semester.create({ ...newSemester, user_id: user.id });
      setNewSemester({ name: '', start_date: '', end_date: '' });
      setShowSemesterDialog(false);
      refreshData();
    } catch (error) {
      console.error("Error creating semester:", error);
    }
  };

  const createCourse = async () => {
    if (!activeSemester) {
      alert("Please create and activate a semester first.");
      return;
    }
    try {
      await Course.create({ ...newCourse, semester_id: activeSemester.id });
      setNewCourse({ name: '', code: '', credits: 3, instructor: '' });
      setShowCourseDialog(false);
      refreshData();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const activateSemester = async (semesterId) => {
    try {
      // Deactivate all semesters first
      for (const semester of semesters) {
        if (semester.is_active) {
          await Semester.update(semester.id, { is_active: false });
        }
      }
      // Activate the selected semester
      await Semester.update(semesterId, { is_active: true });
      setActiveSemester(semesterId);
    } catch (error) {
      console.error("Error activating semester:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Semesters</CardTitle>
              <Dialog open={showSemesterDialog} onOpenChange={setShowSemesterDialog}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2"/>Add Semester</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create New Semester</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Semester Name</Label><Input value={newSemester.name} onChange={e => setNewSemester({...newSemester, name: e.target.value})} placeholder="e.g., Fall 2024"/></div>
                    <div><Label>Start Date</Label><Input type="date" value={newSemester.start_date} onChange={e => setNewSemester({...newSemester, start_date: e.target.value})}/></div>
                    <div><Label>End Date</Label><Input type="date" value={newSemester.end_date} onChange={e => setNewSemester({...newSemester, end_date: e.target.value})}/></div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowSemesterDialog(false)}>Cancel</Button>
                      <Button onClick={createSemester}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {semesters.length === 0 ? (
              <p className="text-gray-500 text-center">No semesters created yet.</p>
            ) : (
              <div className="space-y-2">
                {semesters.map(semester => (
                  <div key={semester.id} className={`p-3 border rounded-lg ${semester.is_active ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{semester.name}</h4>
                        <p className="text-sm text-gray-500">{semester.start_date} - {semester.end_date}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant={semester.is_active ? "default" : "outline"}
                        onClick={() => activateSemester(semester.id)}
                      >
                        {semester.is_active ? "Active" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Courses</CardTitle>
              <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!activeSemester}><Plus className="w-4 h-4 mr-2"/>Add Course</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Course Name</Label><Input value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} placeholder="e.g., Introduction to Psychology"/></div>
                    <div><Label>Course Code</Label><Input value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} placeholder="e.g., PSYC 101"/></div>
                    <div><Label>Credits</Label><Input type="number" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}/></div>
                    <div><Label>Instructor</Label><Input value={newCourse.instructor} onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} placeholder="Professor name"/></div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Cancel</Button>
                      <Button onClick={createCourse}>Add Course</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {!activeSemester ? (
              <p className="text-gray-500 text-center">Please create and activate a semester first.</p>
            ) : courses.length === 0 ? (
              <p className="text-gray-500 text-center">No courses added yet.</p>
            ) : (
              <div className="space-y-2">
                {courses.map(course => (
                  <div key={course.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-gray-500">{course.code} • {course.credits} credits</p>
                    {course.instructor && <p className="text-sm text-gray-500">{course.instructor}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}