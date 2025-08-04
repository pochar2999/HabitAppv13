import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { UserHabit } from "../entities/UserHabit";
import { Habit } from "../entities/Habit";
import { HabitLog } from "../entities/HabitLog";
import { HabitStack } from "../entities/HabitStack";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Target, 
  Plus, 
  Flame, 
  Calendar, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Settings,
  Trash2,
  Info,
  Edit,
  Undo,
  ChevronUp,
  ChevronDown,
  Layers,
  Link as LinkIcon
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

export default function Habits() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [habitStacks, setHabitStacks] = useState([]);
  const [showStackDialog, setShowStackDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedHabitInfo, setSelectedHabitInfo] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newStack, setNewStack] = useState({
    name: '',
    description: '',
    color: 'blue',
    user_habit_ids: []
  });
  const [editForm, setEditForm] = useState({
    target_frequency: 'daily',
    reminder_enabled: true,
    reminder_time: '09:00',
    user_answers: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Load data without blocking the UI
      setLoading(false);
      loadData().catch(console.error);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      setUser(userData);
      
      const userHabitsData = await UserHabit.filter(currentUser.uid, { status: "active" });
      setUserHabits(userHabitsData);
      
      const habitsData = await Habit.list();
      setHabits(habitsData);
      
      const stacksData = await HabitStack.filter(currentUser.uid, { is_active: true });
      setHabitStacks(stacksData);
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const allTodayLogs = await HabitLog.filter(currentUser.uid, { date: todayStr });
      
      const myHabitIds = userHabitsData.map(h => h.id);
      const myTodayLogs = allTodayLogs.filter(log => myHabitIds.includes(log.user_habit_id));
      setTodayLogs(myTodayLogs);
    } catch (error) {
      console.error("Error loading data:", error);
      // Don't block the UI on error
    }
  };

  const toggleHabitCompletion = async (userHabit) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const existingLog = todayLogs.find(log => 
      log.user_habit_id === userHabit.id && log.date === todayStr
    );

    try {
      if (existingLog) {
        const newCompleted = !existingLog.completed;
        await HabitLog.update(currentUser.uid, existingLog.id, { completed: newCompleted });
        
        // Update streak and completion counts with proper calculation
        await updateHabitStats(userHabit, newCompleted, existingLog.completed, todayStr);
      } else {
        await HabitLog.create(currentUser.uid, {
          user_habit_id: userHabit.id,
          date: todayStr,
          completed: true
        });
        
        // Update streak and completion counts with proper calculation
        await updateHabitStats(userHabit, true, false, todayStr);
      }
      loadData();
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  const updateHabitStats = async (userHabit, newCompleted, wasCompleted, dateStr) => {
    try {
      let updates = {};
      
      if (newCompleted && !wasCompleted) {
        // Habit was just completed
        const newTotalCompletions = (userHabit.total_completions || 0) + 1;
        const newCurrentStreak = await calculateCurrentStreak(userHabit.id, dateStr);
        const newLongestStreak = Math.max(newCurrentStreak, userHabit.streak_longest || 0);
        
        updates = {
          total_completions: newTotalCompletions,
          streak_current: newCurrentStreak,
          streak_longest: newLongestStreak
        };
      } else if (!newCompleted && wasCompleted) {
        // Habit was unchecked
        const newTotalCompletions = Math.max((userHabit.total_completions || 0) - 1, 0);
        const newCurrentStreak = await calculateCurrentStreak(userHabit.id, dateStr);
        
        updates = {
          total_completions: newTotalCompletions,
          streak_current: newCurrentStreak
        };
      }
      
      if (Object.keys(updates).length > 0) {
        await UserHabit.update(currentUser.uid, userHabit.id, updates);
      }
    } catch (error) {
      console.error("Error updating habit stats:", error);
    }
  };

  const calculateCurrentStreak = async (userHabitId, currentDateStr) => {
    try {
      const logs = await HabitLog.filter(currentUser.uid, { user_habit_id: userHabitId });
      const completedLogs = logs.filter(log => log.completed).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (completedLogs.length === 0) return 0;
      
      let streak = 0;
      let checkDate = new Date(currentDateStr);
      
      // Start from today and work backwards
      while (true) {
        const checkDateStr = format(checkDate, 'yyyy-MM-dd');
        const logForDate = completedLogs.find(log => log.date === checkDateStr);
        
        if (logForDate && logForDate.completed) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error("Error calculating streak:", error);
      return 0;
    }
  };

  const deleteHabit = async (userHabitId) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await UserHabit.delete(currentUser.uid, userHabitId);
        loadData();
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  const moveHabit = async (habitId, direction) => {
    const currentIndex = userHabits.findIndex(h => h.id === habitId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= userHabits.length) return;
    
    const reorderedHabits = [...userHabits];
    [reorderedHabits[currentIndex], reorderedHabits[newIndex]] = [reorderedHabits[newIndex], reorderedHabits[currentIndex]];
    
    setUserHabits(reorderedHabits);
  };

  const showHabitInfo = (userHabit) => {
    const habitDetails = getHabitDetails(userHabit);
    setSelectedHabitInfo({ userHabit, habitDetails });
    setShowInfoDialog(true);
  };

  const startEditHabit = (userHabit) => {
    setEditingHabit(userHabit);
    setEditForm({
      target_frequency: userHabit.target_frequency || 'daily',
      reminder_enabled: userHabit.reminder_enabled !== false,
      reminder_time: userHabit.reminder_time || '09:00',
      user_answers: userHabit.user_answers || {}
    });
    setShowEditDialog(true);
  };

  const saveHabitEdit = async () => {
    if (!editingHabit) return;
    
    try {
      await UserHabit.update(currentUser.uid, editingHabit.id, editForm);
      setShowEditDialog(false);
      setEditingHabit(null);
      loadData();
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const createHabitStack = async () => {
    if (!newStack.name.trim() || newStack.user_habit_ids.length < 2) {
      alert("Please enter a stack name and select at least 2 habits.");
      return;
    }

    try {
      await HabitStack.create(currentUser.uid, {
        ...newStack,
        user_id: currentUser.uid
      });
      
      setNewStack({
        name: '',
        description: '',
        color: 'blue',
        user_habit_ids: []
      });
      setShowStackDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating habit stack:", error);
    }
  };

  const toggleHabitInStack = (habitId) => {
    setNewStack(prev => ({
      ...prev,
      user_habit_ids: prev.user_habit_ids.includes(habitId)
        ? prev.user_habit_ids.filter(id => id !== habitId)
        : [...prev.user_habit_ids, habitId]
    }));
  };

  const reorderStackHabit = (habitId, direction) => {
    const currentIndex = newStack.user_habit_ids.indexOf(habitId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= newStack.user_habit_ids.length) return;
    
    const reordered = [...newStack.user_habit_ids];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    setNewStack(prev => ({ ...prev, user_habit_ids: reordered }));
  };

  const getHabitDetails = (userHabit) => {
    return habits.find(h => h.id === userHabit.habit_id);
  };

  const isHabitCompletedToday = (userHabit) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const log = todayLogs.find(log => 
      log.user_habit_id === userHabit.id && log.date === todayStr
    );
    return log?.completed || false;
  };

  const getCompletionRate = (userHabit) => {
    const startDate = new Date(userHabit.start_date);
    const today = new Date();
    const daysSinceStart = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const completions = userHabit.total_completions || 0;
    return daysSinceStart > 0 ? Math.round((completions / daysSinceStart) * 100) : 0;
  };

  const completedToday = userHabits.filter(uh => isHabitCompletedToday(uh)).length;
  const totalHabits = userHabits.length;
  const progressPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-2">Track your daily habits and build consistency</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showStackDialog} onOpenChange={setShowStackDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={userHabits.length < 2}>
                <Layers className="w-4 h-4 mr-2" />
                Start a Habit Stack
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Habit Stack</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Stack Name</Label>
                  <Input
                    value={newStack.name}
                    onChange={(e) => setNewStack({...newStack, name: e.target.value})}
                    placeholder="e.g., Morning Routine"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newStack.description}
                    onChange={(e) => setNewStack({...newStack, description: e.target.value})}
                    placeholder="Describe your habit stack..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Color Theme</Label>
                  <Select value={newStack.color} onValueChange={(value) => setNewStack({...newStack, color: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Select Habits for Stack</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userHabits.map(userHabit => {
                      const habitDetails = getHabitDetails(userHabit);
                      const isSelected = newStack.user_habit_ids.includes(userHabit.id);
                      
                      return (
                        <div key={userHabit.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`} onClick={() => toggleHabitInStack(userHabit.id)}>
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isSelected} readOnly />
                            <span className="text-xl">{habitDetails?.icon}</span>
                            <span className="font-medium">{habitDetails?.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {newStack.user_habit_ids.length > 0 && (
                  <div>
                    <Label>Stack Order (drag to reorder)</Label>
                    <div className="space-y-2">
                      {newStack.user_habit_ids.map((habitId, index) => {
                        const userHabit = userHabits.find(h => h.id === habitId);
                        const habitDetails = getHabitDetails(userHabit);
                        
                        return (
                          <div key={habitId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium w-6">{index + 1}.</span>
                            <span className="text-lg">{habitDetails?.icon}</span>
                            <span className="flex-1">{habitDetails?.title}</span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => reorderStackHabit(habitId, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => reorderStackHabit(habitId, 'down')}
                                disabled={index === newStack.user_habit_ids.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Habit Stacking Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Keep it short:</strong> Start with 3–5 habits</li>
                    <li>• <strong>Use natural order:</strong> Arrange habits in the sequence they would be done</li>
                    <li>• <strong>Attach to an anchor:</strong> Tie the stack to an existing daily action (like brushing teeth)</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowStackDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createHabitStack}>
                    Create Stack
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Link to={createPageUrl("HabitSelect")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {totalHabits > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalHabits}</div>
              <div className="text-sm text-gray-600">Active Habits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{completedToday}</div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {totalHabits > 0 ? Math.max(...userHabits.map(h => h.streak_current || 0), 0) : 0}
              </div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Today's Progress</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Progress */}
      {totalHabits > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {completedToday} of {totalHabits} habits completed
                </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {progressPercentage.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit Stacks */}
      {habitStacks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Habit Stacks
          </h2>
          {habitStacks.map(stack => (
            <Card key={stack.id} className={`bg-${stack.color}-50 border-${stack.color}-200`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  {stack.name}
                </CardTitle>
                {stack.description && (
                  <p className="text-sm text-gray-600">{stack.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {stack.user_habit_ids.map((habitId, index) => {
                    const userHabit = userHabits.find(h => h.id === habitId);
                    const habitDetails = getHabitDetails(userHabit);
                    const isCompleted = isHabitCompletedToday(userHabit);
                    
                    return (
                      <React.Fragment key={habitId}>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          isCompleted ? 'bg-green-100 border-green-300' : 'bg-white border-gray-300'
                        }`}>
                          <span className="text-lg">{habitDetails?.icon}</span>
                          <span className="text-sm font-medium">{habitDetails?.title}</span>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        {index < stack.user_habit_ids.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Habits List */}
      {totalHabits > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Habits</h2>
          {userHabits.map((userHabit, index) => {
            const habitDetails = getHabitDetails(userHabit);
            const isCompleted = isHabitCompletedToday(userHabit);
            const completionRate = getCompletionRate(userHabit);
            
            if (!habitDetails) return null;

            return (
              <Card key={userHabit.id} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabitCompletion(userHabit)}
                      className="w-6 h-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{habitDetails.icon}</span>
                        <div>
                          <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {habitDetails.title}
                          </h3>
                          <p className="text-sm text-gray-600">{habitDetails.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{userHabit.streak_current || 0} day streak</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{userHabit.total_completions || 0} total</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{completionRate}% completion rate</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {habitDetails.category}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            habitDetails.type === 'build' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {habitDetails.type === 'build' ? 'Build' : 'Break'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveHabit(userHabit.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveHabit(userHabit.id, 'down')}
                          disabled={index === userHabits.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHabitCompletion(userHabit)}
                            className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Undo className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showHabitInfo(userHabit)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditHabit(userHabit)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabit(userHabit.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">Start building better habits today!</p>
            <Link to={createPageUrl("HabitSelect")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Habit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Habit Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedHabitInfo?.habitDetails?.icon && (
                <span className="text-2xl">{selectedHabitInfo.habitDetails.icon}</span>
              )}
              {selectedHabitInfo?.habitDetails?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedHabitInfo && (
            <div className="space-y-4">
              <p className="text-gray-700">{selectedHabitInfo.habitDetails?.description}</p>
              
              {selectedHabitInfo.habitDetails?.benefits && (
                <div>
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-1">
                    {selectedHabitInfo.habitDetails.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedHabitInfo.habitDetails?.techniques && (
                <div>
                  <h4 className="font-semibold mb-2">Tips & Techniques:</h4>
                  <div className="space-y-2">
                    {selectedHabitInfo.habitDetails.techniques.map((technique, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <h5 className="font-medium">{technique.name}</h5>
                        <p className="text-sm text-gray-600">{technique.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Habit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Frequency</Label>
              <Select value={editForm.target_frequency} onValueChange={(value) => setEditForm({...editForm, target_frequency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={editForm.reminder_enabled}
                onCheckedChange={(checked) => setEditForm({...editForm, reminder_enabled: checked})}
              />
              <Label>Enable reminders</Label>
            </div>
            {editForm.reminder_enabled && (
              <div>
                <Label>Reminder time</Label>
                <Input
                  type="time"
                  value={editForm.reminder_time}
                  onChange={(e) => setEditForm({...editForm, reminder_time: e.target.value})}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveHabitEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}