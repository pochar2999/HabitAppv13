
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { UserHabit } from "@/entities/UserHabit";
import { Habit } from "@/entities/Habit";
import { HabitLog } from "@/entities/HabitLog";
import { HabitStack } from "@/entities/HabitStack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  Settings, 
  Plus, 
  Target,
  Calendar,
  Flame,
  TrendingUp,
  GripVertical,
  FolderPlus,
  Edit,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Habits() {
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitStacks, setHabitStacks] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStackDialog, setShowStackDialog] = useState(false);
  const [newStack, setNewStack] = useState({
    name: "",
    description: "",
    color: "blue",
    user_habit_ids: []
  });
  const [showHabitSettings, setShowHabitSettings] = useState(false);
  const [showHabitInfo, setShowHabitInfo] = useState(false);
  const [selectedUserHabit, setSelectedUserHabit] = useState(null);
  const [habitAnswers, setHabitAnswers] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, userHabitData, habitData, stackData] = await Promise.all([
        User.me(),
        UserHabit.filter({ status: "active" }),
        Habit.list(),
        HabitStack.filter({ is_active: true })
      ]);
      
      setUser(userData);
      
      // Filter user habits for current user
      const myHabits = userHabitData.filter(uh => uh.user_id === userData.id);
      setUserHabits(myHabits);
      setHabits(habitData);
      
      // Filter stacks for current user
      const myStacks = stackData.filter(stack => stack.user_id === userData.id);
      setHabitStacks(myStacks);
      
      // Load today's logs
      const today = format(new Date(), "yyyy-MM-dd");
      const logs = await HabitLog.filter({ date: today });
      setTodayLogs(logs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleComplete = async (userHabit) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const existingLog = todayLogs.find(log => log.user_habit_id === userHabit.id);
      
      if (existingLog) {
        // Update existing log
        await HabitLog.update(existingLog.id, { completed: true });
      } else {
        // Create new log
        await HabitLog.create({
          user_habit_id: userHabit.id,
          date: today,
          completed: true
        });
      }
      
      // Update streak
      const newStreak = (userHabit.streak_current || 0) + 1;
      await UserHabit.update(userHabit.id, {
        streak_current: newStreak,
        streak_longest: Math.max(newStreak, userHabit.streak_longest || 0),
        total_completions: (userHabit.total_completions || 0) + 1
      });
      
      loadData();
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleUndo = async (userHabit) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const existingLog = todayLogs.find(log => log.user_habit_id === userHabit.id);
      
      if (existingLog) {
        await HabitLog.update(existingLog.id, { completed: false });
        
        // Update streak (only if streak was based on this completion)
        // This is a simplified undo; a more robust system might need to re-evaluate streak based on history
        const newStreak = Math.max(0, (userHabit.streak_current || 0) - 1);
        await UserHabit.update(userHabit.id, {
          streak_current: newStreak,
          total_completions: Math.max(0, (userHabit.total_completions || 0) - 1)
        });
      }
      
      loadData();
    } catch (error) {
      console.error("Error undoing habit:", error);
    }
  };

  const handleDelete = async (userHabit) => {
    try {
      await UserHabit.delete(userHabit.id);
      loadData();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const getHabitDetails = (habitId) => {
    return habits.find(h => h.id === habitId);
  };

  const isCompletedToday = (userHabitId) => {
    const log = todayLogs.find(log => log.user_habit_id === userHabitId);
    return log?.completed || false;
  };

  const createHabitStack = async () => {
    try {
      await HabitStack.create({
        ...newStack,
        user_id: user.id,
        order: habitStacks.length
      });
      setNewStack({
        name: "",
        description: "",
        color: "blue",
        user_habit_ids: []
      });
      setShowStackDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating habit stack:", error);
    }
  };

  const addHabitToStack = async (stackId, userHabitId) => {
    try {
      const stack = habitStacks.find(s => s.id === stackId);
      if (stack) {
        if (stack.user_habit_ids?.includes(userHabitId)) {
          console.warn(`Habit ${userHabitId} is already in stack ${stackId}.`);
          return;
        }
        const updatedIds = [...(stack.user_habit_ids || []), userHabitId];
        await HabitStack.update(stackId, { user_habit_ids: updatedIds });
        loadData();
      }
    } catch (error) {
      console.error("Error adding habit to stack:", error);
    }
  };

  const removeHabitFromStack = async (stackId, userHabitId) => {
    try {
      const stack = habitStacks.find(s => s.id === stackId);
      if (stack) {
        const updatedIds = (stack.user_habit_ids || []).filter(id => id !== userHabitId);
        await HabitStack.update(stackId, { user_habit_ids: updatedIds });
        loadData();
      }
    } catch (error) {
      console.error("Error removing habit from stack:", error);
    }
  };

  const moveHabit = async (habitId, direction) => {
    const individualHabits = userHabits.filter(uh => !habitStacks.some(stack => stack.user_habit_ids?.includes(uh.id)));
    
    const currentIndex = individualHabits.findIndex(h => h.id === habitId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= individualHabits.length) return;

    const reorderedIndividualHabits = [...individualHabits];
    [reorderedIndividualHabits[currentIndex], reorderedIndividualHabits[newIndex]] = 
      [reorderedIndividualHabits[newIndex], reorderedIndividualHabits[currentIndex]];

    // This local state update is for visual reordering. For persistent reordering,
    // you would need an 'order' property on UserHabit and update it in the DB.
    // For now, this just re-renders the list in the desired order.
    // A full implementation would involve updating the 'order' property for all affected habits.
    
    // To properly persist order, you'd likely need to save the new order for each habit.
    // This is a placeholder for that logic.
    // Example: await Promise.all(reorderedIndividualHabits.map((habit, idx) => UserHabit.update(habit.id, { order: idx })));
    setUserHabits(prevHabits => {
        const otherHabits = prevHabits.filter(uh => habitStacks.some(stack => stack.user_habit_ids?.includes(uh.id)) || !individualHabits.some(ih => ih.id === uh.id));
        return [...otherHabits, ...reorderedIndividualHabits];
    });
  };

  const getStackColor = (color) => {
    const colors = {
      blue: "bg-blue-100 border-blue-300",
      green: "bg-green-100 border-green-300",
      purple: "bg-purple-100 border-purple-300",
      orange: "bg-orange-100 border-orange-300",
      pink: "bg-pink-100 border-pink-300",
      yellow: "bg-yellow-100 border-yellow-300"
    };
    return colors[color] || colors.blue;
  };

  const openHabitSettings = (userHabit) => {
    setSelectedUserHabit(userHabit);
    setHabitAnswers(userHabit.user_answers || {});
    setShowHabitSettings(true);
  };

  const openHabitInfo = (userHabit) => {
    setSelectedUserHabit(userHabit);
    setShowHabitInfo(true);
  };

  const saveHabitSettings = async () => {
    try {
      if (selectedUserHabit) {
        await UserHabit.update(selectedUserHabit.id, {
          user_answers: habitAnswers
        });
      }
      setShowHabitSettings(false);
      setSelectedUserHabit(null);
      loadData();
    } catch (error) {
      console.error("Error updating habit settings:", error);
    }
  };

  const updateAnswer = (questionKey, value) => {
    setHabitAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ensure individualHabits are derived correctly and stably
  // Filter out habits that are part of *any* stack
  const individualHabits = userHabits.filter(uh => !habitStacks.some(stack => stack.user_habit_ids?.includes(uh.id)));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-1">
            Track your progress and build consistency
          </p>
        </div>
        <Link to={createPageUrl("HabitSelect?type=build")}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Habits</p>
                <p className="text-2xl font-bold text-gray-900">{userHabits.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayLogs.filter(log => log.completed).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...userHabits.map(h => h.streak_longest || 0), 0)}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit Stacks and Individual Habits */}
      <div className="space-y-6">
        {/* Create Stack Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Your Habits</h2>
          <Dialog open={showStackDialog} onOpenChange={setShowStackDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                Create Habit Stack
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit Stack</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stack-name">Stack Name</Label>
                  <Input
                    id="stack-name"
                    value={newStack.name}
                    onChange={(e) => setNewStack({...newStack, name: e.target.value})}
                    placeholder="e.g., Morning Routine"
                  />
                </div>
                <div>
                  <Label htmlFor="stack-description">Description</Label>
                  <Textarea
                    id="stack-description"
                    value={newStack.description}
                    onChange={(e) => setNewStack({...newStack, description: e.target.value})}
                    placeholder="Describe this habit stack..."
                  />
                </div>
                <div>
                  <Label>Color Theme</Label>
                  <div className="flex gap-2 mt-2">
                    {['blue', 'green', 'purple', 'orange', 'pink', 'yellow'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${getStackColor(color)} ${
                          newStack.color === color ? 'ring-2 ring-gray-400' : ''
                        }`}
                        onClick={() => setNewStack({...newStack, color})}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowStackDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createHabitStack} disabled={!newStack.name}>
                    Create Stack
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Habit Stacks */}
        {habitStacks.length > 0 && (
          <div className="space-y-4">
            {habitStacks.map((stack) => {
              const stackHabits = userHabits.filter(uh => stack.user_habit_ids?.includes(uh.id));
              const stackCompletedToday = stackHabits.filter(uh => isCompletedToday(uh.id)).length;
              
              return (
                <motion.div
                  key={stack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 border-dashed rounded-xl p-4 ${getStackColor(stack.color)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{stack.name}</h3>
                      {stack.description && (
                        <p className="text-sm text-gray-600">{stack.description}</p>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        {stackCompletedToday}/{stackHabits.length} completed today
                      </div>
                    </div>
                    {/* Add options for stack settings or deletion if needed here */}
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {stackHabits.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No habits in this stack yet. Add some below!</p>
                    ) : (
                      stackHabits.map((userHabit) => {
                        const habitDetails = getHabitDetails(userHabit.habit_id);
                        const completedToday = isCompletedToday(userHabit.id);
                        
                        return (
                          <div
                            key={userHabit.id}
                            className={`p-3 rounded-lg bg-white/60 backdrop-blur-sm border transition-all duration-300 ${
                              completedToday ? "border-green-300 bg-green-50/60" : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  habitDetails?.type === "build" 
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                                    : "bg-gradient-to-r from-red-500 to-pink-500"
                                }`}>
                                  <Target className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-md font-semibold text-gray-900">
                                    {habitDetails?.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1 text-sm">
                                    <Badge variant="secondary" className="px-2 py-0.5">
                                      {habitDetails?.category}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Flame className="w-3 h-3 text-orange-500" />
                                      {userHabit.streak_current || 0}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <TrendingUp className="w-3 h-3 text-blue-500" />
                                      {userHabit.total_completions || 0}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {completedToday ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleUndo(userHabit)}
                                    className="text-orange-600 hover:text-orange-700 w-8 h-8"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="icon"
                                    onClick={() => handleComplete(userHabit)}
                                    className="bg-green-600 hover:bg-green-700 text-white w-8 h-8"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeHabitFromStack(stack.id, userHabit.id)}
                                  className="text-gray-600 hover:text-gray-700 w-8 h-8"
                                >
                                  <FolderPlus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(userHabit)}
                                  className="text-red-600 hover:text-red-700 w-8 h-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openHabitSettings(userHabit)}
                                  className="text-gray-600 hover:text-gray-700 w-8 h-8"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Individual Habits (not in stacks) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Individual Habits</h2>
          {individualHabits.length === 0 && habitStacks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-600 mb-6">Start building better habits today!</p>
              <Link to={createPageUrl("HabitSelect?type=build")}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </Link>
            </div>
          ) : individualHabits.length === 0 && habitStacks.length > 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>All your habits are currently organized into stacks.</p>
            </div>
          ) : (
            individualHabits.map((userHabit, index) => {
              const habitDetails = getHabitDetails(userHabit.habit_id);
              const completedToday = isCompletedToday(userHabit.id);
              
              return (
                <motion.div
                  key={userHabit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all duration-300 ${
                    completedToday 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                      : "hover:shadow-lg"
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => moveHabit(userHabit.id, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              aria-label="Move habit up"
                            >
                              ▲
                            </button>
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <button
                              onClick={() => moveHabit(userHabit.id, 'down')}
                              disabled={index === individualHabits.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              aria-label="Move habit down"
                            >
                              ▼
                            </button>
                          </div>
                          
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            habitDetails?.type === "build" 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                              : "bg-gradient-to-r from-red-500 to-pink-500"
                          }`}>
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {habitDetails?.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="secondary">
                                {habitDetails?.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Flame className="w-4 h-4 text-orange-500" />
                                {userHabit.streak_current || 0} day streak
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                {userHabit.total_completions || 0} total
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {completedToday ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUndo(userHabit)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Undo
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleComplete(userHabit)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openHabitInfo(userHabit)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                          
                          {/* Add to Stack dropdown */}
                          {habitStacks.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FolderPlus className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {habitStacks.map(stack => (
                                  <DropdownMenuItem
                                    key={stack.id}
                                    onClick={() => addHabitToStack(stack.id, userHabit.id)}
                                    disabled={stack.user_habit_ids?.includes(userHabit.id)}
                                  >
                                    Add to {stack.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(userHabit)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openHabitSettings(userHabit)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Habit Settings Dialog */}
      <Dialog open={showHabitSettings} onOpenChange={setShowHabitSettings}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Habit Settings</DialogTitle>
          </DialogHeader>
          {selectedUserHabit && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">
                  {getHabitDetails(selectedUserHabit.habit_id)?.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Customize your habit preferences and settings
                </p>
              </div>

              {getHabitDetails(selectedUserHabit.habit_id)?.questions?.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label className="font-medium">{question.question}</Label>
                  {question.type === "select" ? (
                    <select
                      className="w-full p-2 border rounded-md"
                      value={habitAnswers[`question_${index}`] || ""}
                      onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {question.options?.map((option, optIndex) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : question.type === "time" ? (
                    <Input
                      type="time"
                      value={habitAnswers[`question_${index}`] || ""}
                      onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                    />
                  ) : question.type === "number" ? (
                    <Input
                      type="number"
                      value={habitAnswers[`question_${index}`] || ""}
                      onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                    />
                  ) : question.type === "text" || question.type === "textarea" ? (
                    question.type === "textarea" ? (
                      <Textarea
                        value={habitAnswers[`question_${index}`] || ""}
                        onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={habitAnswers[`question_${index}`] || ""}
                        onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                      />
                    )
                  ) : (
                    <Input
                      type="text" // Default to text for unknown types
                      value={habitAnswers[`question_${index}`] || ""}
                      onChange={(e) => updateAnswer(`question_${index}`, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowHabitSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={saveHabitSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Habit Info Dialog */}
      <Dialog open={showHabitInfo} onOpenChange={setShowHabitInfo}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Habit Information</DialogTitle>
          </DialogHeader>
          {selectedUserHabit && (
            <div className="space-y-6">
              {(() => {
                const habitDetails = getHabitDetails(selectedUserHabit.habit_id);
                return (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        habitDetails?.type === "build" 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                          : "bg-gradient-to-r from-red-500 to-pink-500"
                      }`}>
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{habitDetails?.title}</h2>
                        <p className="text-gray-600 mt-1">{habitDetails?.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {habitDetails?.category}
                        </Badge>
                      </div>
                    </div>

                    {habitDetails?.benefits && habitDetails.benefits.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                        <ul className="space-y-2">
                          {habitDetails.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {habitDetails?.techniques && habitDetails.techniques.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Science-Backed Techniques</h3>
                        <div className="space-y-4">
                          {habitDetails.techniques.map((technique, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-900">{technique.name}</h4>
                              <p className="text-gray-700 mt-1">{technique.description}</p>
                              {technique.scientific_backing && (
                                <p className="text-sm text-blue-600 mt-2 italic">
                                  💡 {technique.scientific_backing}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
