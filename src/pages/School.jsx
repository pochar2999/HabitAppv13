import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { Semester } from "../entities/Semester";
import { Course } from "../entities/Course";
import { SchoolAssignment } from "../entities/SchoolAssignment";
import { StudyLog } from "../entities/StudyLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import SchoolAssignments from "../components/school/SchoolAssignments";
import SchoolCalendar from "../components/school/SchoolCalendar";
import SchoolSetup from "../components/school/SchoolSetup";
import SchoolStudyTracker from "../components/school/SchoolStudyTracker";
import { GraduationCap } from "lucide-react";

export default function School() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
      loadData().catch(console.error);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      if (!userData) {
        console.warn("User data is null, cannot load dependent data.");
        return;
      }
      setUser(userData);
      
      const semesterData = await Semester.filter({ user_id: userData.id });
      setSemesters(semesterData);
      
      const activeSem = semesterData.find(s => s.is_active);
      setActiveSemester(activeSem);
      
      if (activeSem) {
        const courseData = await Course.filter({ semester_id: activeSem.id });
        setCourses(courseData);
        
        const assignmentData = await SchoolAssignment.filter({ user_id: userData.id });
        const semesterAssignments = assignmentData.filter(a => 
          courseData.some(c => c.id === a.course_id)
        );
        setAssignments(semesterAssignments);
        
        const studyData = await StudyLog.list();
        const semesterStudyLogs = studyData.filter(log => 
          courseData.some(c => c.id === log.course_id)
        );
        setStudyLogs(semesterStudyLogs);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const refreshData = () => {
    loadData();
  };

  const refreshAssignments = async () => {
    if (activeSemester) {
      const assignmentData = await SchoolAssignment.filter({ user_id: user.id });
      const semesterAssignments = assignmentData.filter(a => 
        courses.some(c => c.id === a.course_id)
      );
      setAssignments(semesterAssignments);
    }
  };

  const refreshStudyLogs = async () => {
    if (activeSemester) {
      const studyData = await StudyLog.list();
      const semesterStudyLogs = studyData.filter(log => 
        courses.some(c => c.id === log.course_id)
      );
      setStudyLogs(semesterStudyLogs);
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GraduationCap className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">School Hub</h1>
        </div>
        <p className="text-gray-600">Manage your academic life and track your progress</p>
      </div>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="study">Study Tracker</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <SchoolAssignments
            assignments={assignments}
            courses={courses}
            refreshAssignments={refreshAssignments}
            loading={false}
            activeSemester={activeSemester}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <SchoolCalendar
            assignments={assignments}
            courses={courses}
            activeSemester={activeSemester}
            loading={false}
          />
        </TabsContent>

        <TabsContent value="study">
          <SchoolStudyTracker
            courses={courses}
            studyLogs={studyLogs}
            refreshStudyLogs={refreshStudyLogs}
            loading={false}
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
            setActiveSemester={setActiveSemester}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}