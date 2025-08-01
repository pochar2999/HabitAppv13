import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { WorkoutSession } from "../entities/WorkoutSession";
import { WorkoutTemplate } from "../entities/WorkoutTemplate";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Plus, Dumbbell, Calendar, TrendingUp, Clock, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutTracker() {
  const [user, setUser]= useState(null);
  const [sessions, setSessions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newSession, setNewSession] = useState({
    routine_name: '',
    exercises: [],
    duration_minutes: '',
    notes: ''
  });
  const [newTemplate, setNewTemplate] = useState({
    routine_name: '',
    day_of_week: 'Monday',
    exercises: []
  });
  const [newExercise, setNewExercise] = useState({
    exercise_name: '',
    target_sets: '',
    target_reps: '',
    notes: ''
  });
  const [newSessionExercise, setNewSessionExercise] = useState({
    exercise_name: '',
    sets: []
  });
  const [newSet, setNewSet] = useState({
    reps: '',
    weight: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const sessionData = await WorkoutSession.filter({ user_id: userData.id });
      setSessions(sessionData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      const templateData = await WorkoutTemplate.filter({ user_id: userData.id });
      setTemplates(templateData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createSession = async () => {
    if (!newSession.routine_name.trim() || newSession.exercises.length === 0) {
      alert("Please enter a routine name and add at least one exercise.");
      return;
    }

    try {
      await WorkoutSession.create({
        ...newSession,
        user_id: user.id,
        duration_minutes: parseInt(newSession.duration_minutes) || 0
      });
      
      setNewSession({
        routine_name: '',
        exercises: [],
        duration_minutes: '',
        notes: ''
      });
      setShowSessionDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.routine_name.trim() || newTemplate.exercises.length === 0) {
      alert("Please enter a routine name and add at least one exercise.");
      return;
    }

    try {
      const templateToSave = {
        ...newTemplate,
        user_id: user.id,
        exercises: newTemplate.exercises.map(ex => ({
          ...ex,
          target_sets: parseInt(ex.target_sets) || 1
        }))
      };

      if (editingTemplate) {
        await WorkoutTemplate.update(editingTemplate.id, templateToSave);
      } else {
        await WorkoutTemplate.create(templateToSave);
      }
      
      setNewTemplate({
        routine_name: '',
        day_of_week: 'Monday',
        exercises: []
      });
      setEditingTemplate(null);
      setShowTemplateDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const addExerciseToTemplate = () => {
    if (!newExercise.exercise_name.trim()) return;
    
    setNewTemplate(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise }]
    }));
    setNewExercise({
      exercise_name: '',
      target_sets: '',
      target_reps: '',
      notes: ''
    });
  };

  const addExerciseToSession = () => {
    if (!newSessionExercise.exercise_name.trim()) return;
    
    setNewSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newSessionExercise }]
    }));
    setNewSessionExercise({
      exercise_name: '',
      sets: []
    });
  };

  const addSetToExercise = (exerciseIndex) => {
    if (!newSet.reps) return;
    
    setNewSession(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: [...updatedExercises[exerciseIndex].sets, { ...newSet }]
      };
      return { ...prev, exercises: updatedExercises };
    });
    setNewSet({
      reps: '',
      weight: '',
      notes: ''
    });
  };

  const removeExerciseFromTemplate = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const removeExerciseFromSession = (index) => {
    setNewSession(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const deleteTemplate = async (id) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await WorkoutTemplate.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const startEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      routine_name: template.routine_name,
      day_of_week: template.day_of_week,
      exercises: template.exercises || []
    });
    setShowTemplateDialog(true);
  };

  const useTemplate = (template) => {
    setNewSession(prev => ({
      ...prev,
      routine_name: template.routine_name,
      exercises: template.exercises.map(ex => ({
        exercise_name: ex.exercise_name,
        sets: []
      }))
    }));
    setShowSessionDialog(true);
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const totalWorkoutTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const averageWorkoutTime = totalSessions > 0 ? Math.round(totalWorkoutTime / totalSessions) : 0;
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return sessionDate >= weekStart;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workout Tracker</h1>
          <p className="text-gray-600 mt-2">Log your fitness activities and track progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalSessions}</div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(totalWorkoutTime / 60)}h</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{averageWorkoutTime}m</div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{thisWeekSessions}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">Workout Sessions</TabsTrigger>
          <TabsTrigger value="templates">Workout Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Workouts</h3>
            <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Workout Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Routine Name</Label>
                    <Input
                      value={newSession.routine_name}
                      onChange={(e) => setNewSession({...newSession, routine_name: e.target.value})}
                      placeholder="e.g., Push Day, Leg Day"
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newSession.duration_minutes}
                      onChange={(e) => setNewSession({...newSession, duration_minutes: e.target.value})}
                      placeholder="60"
                    />
                  </div>
                  
                  {/* Exercises */}
                  <div>
                    <Label>Exercises</Label>
                    <div className="space-y-3">
                      {newSession.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{exercise.exercise_name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExerciseFromSession(exerciseIndex)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="text-sm bg-gray-50 p-2 rounded">
                                Set {setIndex + 1}: {set.reps} reps
                                {set.weight && ` @ ${set.weight} lbs`}
                                {set.notes && ` - ${set.notes}`}
                              </div>
                            ))}
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                type="number"
                                placeholder="Reps"
                                value={newSet.reps}
                                onChange={(e) => setNewSet({...newSet, reps: e.target.value})}
                              />
                              <Input
                                type="number"
                                placeholder="Weight"
                                value={newSet.weight}
                                onChange={(e) => setNewSet({...newSet, weight: e.target.value})}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addSetToExercise(exerciseIndex)}
                                disabled={!newSet.reps}
                              >
                                Add Set
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Exercise name"
                            value={newSessionExercise.exercise_name}
                            onChange={(e) => setNewSessionExercise({...newSessionExercise, exercise_name: e.target.value})}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addExerciseToSession}
                            disabled={!newSessionExercise.exercise_name.trim()}
                          >
                            Add Exercise
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newSession.notes}
                      onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                      placeholder="How did the workout go?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createSession}>
                      Log Workout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{session.routine_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.date), 'MMM d, yyyy')}
                          </div>
                          {session.duration_minutes > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.duration_minutes} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {session.exercises && session.exercises.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Exercises:</h4>
                        {session.exercises.map((exercise, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <h5 className="font-medium mb-2">{exercise.exercise_name}</h5>
                            {exercise.sets && exercise.sets.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {exercise.sets.map((set, setIndex) => (
                                  <div key={setIndex} className="text-sm bg-white p-2 rounded border">
                                    Set {setIndex + 1}: {set.reps} reps
                                    {set.weight && ` @ ${set.weight} lbs`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {session.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{session.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts logged yet</h3>
                <p className="text-gray-600 mb-6">Start tracking your fitness journey by logging your first workout.</p>
                <Button onClick={() => setShowSessionDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Workout
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Workout Templates</h3>
            <Dialog open={showTemplateDialog} onOpenChange={(open) => {
              setShowTemplateDialog(open);
              if (!open) {
                setEditingTemplate(null);
                setNewTemplate({
                  routine_name: '',
                  day_of_week: 'Monday',
                  exercises: []
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Workout Template'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Routine Name</Label>
                      <Input
                        value={newTemplate.routine_name}
                        onChange={(e) => setNewTemplate({...newTemplate, routine_name: e.target.value})}
                        placeholder="e.g., Push Day"
                      />
                    </div>
                    <div>
                      <Label>Day of Week</Label>
                      <Select value={newTemplate.day_of_week} onValueChange={(value) => setNewTemplate({...newTemplate, day_of_week: value})}>
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
                    <Label>Exercises</Label>
                    <div className="space-y-3">
                      {newTemplate.exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{exercise.exercise_name}</h4>
                              <p className="text-sm text-gray-600">
                                {exercise.target_sets} sets × {exercise.target_reps} reps
                                {exercise.notes && ` - ${exercise.notes}`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExerciseFromTemplate(index)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Input
                            placeholder="Exercise name"
                            value={newExercise.exercise_name}
                            onChange={(e) => setNewExercise({...newExercise, exercise_name: e.target.value})}
                          />
                          <Input
                            type="number"
                            placeholder="Sets"
                            value={newExercise.target_sets}
                            onChange={(e) => setNewExercise({...newExercise, target_sets: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Target reps (e.g., 8-12)"
                            value={newExercise.target_reps}
                            onChange={(e) => setNewExercise({...newExercise, target_reps: e.target.value})}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addExerciseToTemplate}
                            disabled={!newExercise.exercise_name.trim() || !newExercise.target_sets}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createTemplate}>
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{template.routine_name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {template.day_of_week}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditTemplate(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {template.exercises && template.exercises.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Exercises:</h4>
                        {template.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {exercise.exercise_name} ({exercise.target_sets}×{exercise.target_reps})
                          </div>
                        ))}
                        {template.exercises.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{template.exercises.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => useTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-6">Create workout templates to quickly log similar routines.</p>
                <Button onClick={() => setShowTemplateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}