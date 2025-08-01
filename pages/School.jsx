import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Semester } from '@/entities/Semester';
import { Course } from '@/entities/Course';
import { SchoolAssignment } from '@/entities/SchoolAssignment';
import { StudyLog } from '@/entities/StudyLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft, BookOpen, Calendar, BarChart2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SchoolSetup from '@/components/school/SchoolSetup';
import SchoolAssignments from '@/components/school/SchoolAssignments';
import SchoolCalendar from '@/components/school/SchoolCalendar';
import SchoolStudyTracker from '@/components/school/SchoolStudyTracker';

export default function School() {
  const [user, setUser] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      await loadSemesters(userData.id);
    } catch (error) {
      console.error("Error loading initial school data:", error);
      setLoading(false);
    }
  };

  const loadSemesters = async (userId) => {
    const allSemesters = await Semester.filter({ user_id: userId });
    setSemesters(allSemesters);
    const currentActive = allSemesters.find(s => s.is_active);
    if (currentActive) {
      await loadDataForSemester(currentActive.id);
    } else {
      setActiveSemester(null);
      setCourses([]);
      setAssignments([]);
      setStudyLogs([]);
      setLoading(false);
    }
  };
  
  const loadDataForSemester = async (semesterId) => {
    setLoading(true);
    try {
      const semester = await Semester.get(semesterId);
      setActiveSemester(semester);
      
      const [coursesData, assignmentsData, studyLogsData] = await Promise.all([
        Course.filter({ semester_id: semesterId }),
        SchoolAssignment.list(), // Fetch all and filter client-side
        StudyLog.list() // Fetch all and filter client-side
      ]);
      
      const courseIdsInSemester = coursesData.map(c => c.id);

      const semesterAssignments = assignmentsData.filter(a => courseIdsInSemester.includes(a.course_id));
      const semesterStudyLogs = studyLogsData.filter(log => courseIdsInSemester.includes(log.course_id));

      setCourses(coursesData);
      setAssignments(semesterAssignments);
      setStudyLogs(semesterStudyLogs);
    } catch (error) {
        console.error("Error loading data for semester:", error);
    }
    setLoading(false);
  };
  
  const refreshData = () => {
    if (user) {
      loadSemesters(user.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Hub</h1>
            <p className="text-gray-600 mt-1">
              {activeSemester ? `Viewing: ${activeSemester.name}` : "Organize your academic life."}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments"><BookOpen className="w-4 h-4 mr-2"/>Assignments</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="w-4 h-4 mr-2"/>Calendar</TabsTrigger>
          <TabsTrigger value="study-tracker"><BarChart2 className="w-4 h-4 mr-2"/>Study Tracker</TabsTrigger>
          <TabsTrigger value="setup"><Settings className="w-4 h-4 mr-2"/>Setup</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <SchoolAssignments 
            assignments={assignments}
            courses={courses}
            refreshAssignments={refreshData}
            loading={loading}
            activeSemester={activeSemester}
          />
        </TabsContent>
        <TabsContent value="calendar">
            <SchoolCalendar
                assignments={assignments}
                courses={courses}
                activeSemester={activeSemester}
                loading={loading}
            />
        </TabsContent>
        <TabsContent value="study-tracker">
          <SchoolStudyTracker
            courses={courses}
            studyLogs={studyLogs}
            refreshStudyLogs={refreshData}
            loading={loading}
            activeSemester={activeSemester}
          />
        </TabsContent>
        <TabsContent value="setup">
          <SchoolSetup 
            user={user}
            semesters={semesters}
            courses={courses}
            activeSemester={activeSemester}
            refreshData={refreshData}
            setActiveSemester={loadDataForSemester}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
