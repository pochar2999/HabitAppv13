
import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '@/entities/WorkoutSession';
import { WorkoutTemplate } from '@/entities/WorkoutTemplate';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Dumbbell, 
  Play, 
  Square, 
  Edit, 
  Trash2, 
  Calendar,
  Target,
  Timer,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutTracker() {
  const [templates, setTemplates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    routine_name: '',
    day_of_week: 'Monday',
    exercises: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [templatesData, sessionsData] = await Promise.all([
        WorkoutTemplate.filter({ user_id: userData.id }),
        WorkoutSession.filter({ user_id: userData.id })
      ]);
      
      setTemplates(templatesData);
      setSessions(sessionsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error loading workout data:", error);
    }
    setLoading(false);
  };

  const startWorkout = (template) => {
    const workoutSession = {
      ...template,
      exercises: template.exercises.map(ex => ({
        ...ex,
        sets: Array(ex.target_sets || 3).fill(null).map(() => ({ reps: '', weight: '', notes: '' }))
      })),
      start_time: new Date().toISOString(),
      duration_minutes: 0
    };
    setActiveWorkout(workoutSession);
    setWorkoutInProgress(true);
  };

  const endWorkout = async () => {
    if (!activeWorkout) return;
    
    try {
      const endTime = new Date();
      const startTime = new Date(activeWorkout.start_time);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

      // Sanitize exercises data before creation
      const sanitizedExercises = activeWorkout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
              reps: parseInt(set.reps) || 0,
              weight: parseFloat(set.weight) || 0,
              notes: set.notes || ''
          }))
      }));
      
      await WorkoutSession.create({
        user_id: user.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        routine_name: activeWorkout.routine_name,
        exercises: sanitizedExercises,
        duration_minutes: durationMinutes,
        notes: activeWorkout.notes || ''
      });
      
      setWorkoutInProgress(false);
      setActiveWorkout(null);
      loadData();
    } catch (error) {
      console.error("Error ending workout:", error);
    }
  };

  const updateWorkoutSet = (exerciseIndex, setIndex, field, value) => {
    setActiveWorkout(prev => {
      const updated = { ...prev };
      updated.exercises[exerciseIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        await WorkoutTemplate.update(editingTemplate.id, newTemplate);
      } else {
        await WorkoutTemplate.create({ ...newTemplate, user_id: user.id });
      }
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setNewTemplate({ routine_name: '', day_of_week: 'Monday', exercises: [] });
      loadData();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (confirm("Are you sure you want to delete this workout template?")) {
      try {
        await WorkoutTemplate.delete(templateId);
        loadData();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const addExercise = () => {
    setNewTemplate(prev => ({
      ...prev,
      exercises: [...prev.exercises, { exercise_name: '', target_sets: 3, target_reps: '8-12', notes: '' }]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workout Tracker</h1>
            <p className="text-gray-600 mt-1">Plan routines and track your fitness progress</p>
          </div>
        </div>
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingTemplate(null);
                setNewTemplate({ routine_name: '', day_of_week: 'Monday', exercises: [] });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Workout Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Routine Name</Label>
                  <Input
                    value={newTemplate.routine_name}
                    onChange={(e) => setNewTemplate({...newTemplate, routine_name: e.target.value})}
                    placeholder="e.g., Push Day, Pull Day"
                  />
                </div>
                <div>
                  <Label>Day of Week</Label>
                  <Select
                    value={newTemplate.day_of_week}
                    onValueChange={(value) => setNewTemplate({...newTemplate, day_of_week: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Exercises</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>
                <div className="space-y-3">
                  {newTemplate.exercises.map((exercise, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Exercise name"
                        value={exercise.exercise_name}
                        onChange={(e) => {
                          const updated = [...newTemplate.exercises];
                          updated[index].exercise_name = e.target.value;
                          setNewTemplate({...newTemplate, exercises: updated});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.target_sets}
                        onChange={(e) => {
                          const updated = [...newTemplate.exercises];
                          updated[index].target_sets = parseInt(e.target.value) || 0;
                          setNewTemplate({...newTemplate, exercises: updated});
                        }}
                      />
                      <Input
                        placeholder="Reps (e.g., 8-12)"
                        value={exercise.target_reps}
                        onChange={(e) => {
                          const updated = [...newTemplate.exercises];
                          updated[index].target_reps = e.target.value;
                          setNewTemplate({...newTemplate, exercises: updated});
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updated = newTemplate.exercises.filter((_, i) => i !== index);
                          setNewTemplate({...newTemplate, exercises: updated});
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Workout Session */}
      {workoutInProgress && activeWorkout && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">
                <Timer className="w-5 h-5 inline mr-2" />
                Active Workout: {activeWorkout.routine_name}
              </CardTitle>
              <Button onClick={endWorkout} className="bg-green-600 hover:bg-green-700 text-white">
                <Square className="w-4 h-4 mr-2" />
                End Workout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkout.exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold mb-3">{exercise.exercise_name}</h4>
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm font-medium">Set {setIndex + 1}:</span>
                        <Input
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateWorkoutSet(exIndex, setIndex, 'reps', e.target.value)}
                        />
                        <Input
                          placeholder="Weight (lbs)"
                          value={set.weight}
                          onChange={(e) => updateWorkoutSet(exIndex, setIndex, 'weight', e.target.value)}
                        />
                        <Input
                          placeholder="Notes"
                          value={set.notes}
                          onChange={(e) => updateWorkoutSet(exIndex, setIndex, 'notes', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Workout Templates</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No workout templates yet</h3>
              <p className="text-gray-600 mb-6">Create your first workout template to get started!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.routine_name}</CardTitle>
                      <Badge variant="secondary">{template.day_of_week}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {template.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {exercise.exercise_name} ({exercise.target_sets} sets, {exercise.target_reps} reps)
                        </div>
                      ))}
                      {template.exercises.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{template.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => startWorkout(template)}
                        disabled={workoutInProgress}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setNewTemplate(template);
                          setShowTemplateDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No workout history yet</h3>
              <p className="text-gray-600 mb-6">Complete your first workout to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{session.routine_name}</CardTitle>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.duration_minutes} minutes
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.exercises.map((exercise, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-medium">{exercise.exercise_name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {exercise.sets.map((set, setIndex) => (
                              <span key={setIndex} className="mr-3">
                                {set.reps} reps {set.weight && `@ ${set.weight}lbs`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {session.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
