import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { UserHabit } from "../entities/UserHabit";
import { Habit } from "../entities/Habit";
import { HabitLog } from "../entities/HabitLog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, RotateCcw, Target, Trash2, RefreshCw } from "lucide-react";

export default function ResetHabits() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      setUser(userData);
      
      const userHabitsData = await UserHabit.filter(currentUser.uid);
      setUserHabits(userHabitsData);
      
      const habitsData = await Habit.list();
      setHabits(habitsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getHabitDetails = (userHabit) => {
    return habits.find(h => h.id === userHabit.habit_id);
  };

  const toggleHabitSelection = (habitId) => {
    setSelectedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const selectAllHabits = () => {
    setSelectedHabits(new Set(userHabits.map(h => h.id)));
  };

  const deselectAllHabits = () => {
    setSelectedHabits(new Set());
  };

  const resetSelectedHabits = async () => {
    if (selectedHabits.size === 0) {
      alert("Please select at least one habit to reset.");
      return;
    }

    const confirmMessage = `Are you sure you want to reset ${selectedHabits.size} habit(s)? This will:
    
• Reset all streaks to 0
• Clear all completion history
• Keep the habit active for a fresh start

This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setResetting(true);
    try {
      // Reset each selected habit
      for (const habitId of selectedHabits) {
        await UserHabit.update(currentUser.uid, habitId, {
          streak_current: 0,
          streak_longest: 0,
          total_completions: 0
        });
      }

      // Delete all logs for selected habits
      const allLogs = await HabitLog.list(currentUser.uid);
      const logsToDelete = allLogs.filter(log => selectedHabits.has(log.user_habit_id));
      
      for (const log of logsToDelete) {
        await HabitLog.delete(currentUser.uid, log.id);
      }

      setSelectedHabits(new Set());
      loadData();
      alert("Selected habits have been reset successfully!");
    } catch (error) {
      console.error("Error resetting habits:", error);
      alert("Error resetting habits. Please try again.");
    }
    setResetting(false);
  };

  const deleteSelectedHabits = async () => {
    if (selectedHabits.size === 0) {
      alert("Please select at least one habit to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to permanently delete ${selectedHabits.size} habit(s)? This will:
    
• Remove the habit completely
• Delete all associated logs and data
• Cannot be undone

This action is permanent.`;

    if (!confirm(confirmMessage)) return;

    setResetting(true);
    try {
      // Delete all logs for selected habits first
      const allLogs = await HabitLog.list(currentUser.uid);
      const logsToDelete = allLogs.filter(log => selectedHabits.has(log.user_habit_id));
      
      for (const log of logsToDelete) {
        await HabitLog.delete(currentUser.uid, log.id);
      }

      // Delete the habits
      for (const habitId of selectedHabits) {
        await UserHabit.delete(currentUser.uid, habitId);
      }

      setSelectedHabits(new Set());
      loadData();
      alert("Selected habits have been deleted successfully!");
    } catch (error) {
      console.error("Error deleting habits:", error);
      alert("Error deleting habits. Please try again.");
    }
    setResetting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Reset Habits</h1>
        <p className="text-gray-600 mt-2">Manage your habit data and start fresh when needed</p>
      </div>

      {/* Warning Card */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Important Warning</h3>
              <div className="text-sm text-red-800 space-y-1">
                <p><strong>Reset:</strong> Clears streaks and logs but keeps the habit active</p>
                <p><strong>Delete:</strong> Permanently removes the habit and all data</p>
                <p className="font-medium mt-2">These actions cannot be undone. Please proceed carefully.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userHabits.length}</div>
            <div className="text-sm text-gray-600">Total Habits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RotateCcw className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{selectedHabits.size}</div>
            <div className="text-sm text-gray-600">Selected for Action</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {userHabits.filter(h => h.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Habits</div>
          </CardContent>
        </Card>
      </div>

      {userHabits.length > 0 ? (
        <>
          {/* Selection Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedHabits.size} of {userHabits.length} habits selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllHabits}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllHabits}>
                      Deselect All
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetSelectedHabits}
                    disabled={selectedHabits.size === 0 || resetting}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    {resetting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Selected
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={deleteSelectedHabits}
                    disabled={selectedHabits.size === 0 || resetting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits List */}
          <div className="space-y-4">
            {userHabits.map((userHabit) => {
              const habitDetails = getHabitDetails(userHabit);
              const isSelected = selectedHabits.has(userHabit.id);
              
              if (!habitDetails) return null;

              return (
                <Card key={userHabit.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleHabitSelection(userHabit.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{habitDetails.icon}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {habitDetails.title}
                            </h3>
                            <p className="text-sm text-gray-600">{habitDetails.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div>Current Streak: <span className="font-medium">{userHabit.streak_current || 0} days</span></div>
                          <div>Longest Streak: <span className="font-medium">{userHabit.streak_longest || 0} days</span></div>
                          <div>Total Completions: <span className="font-medium">{userHabit.total_completions || 0}</span></div>
                          <Badge variant="outline" className="text-xs">
                            {habitDetails.category}
                          </Badge>
                          <Badge className={`text-xs ${
                            habitDetails.type === 'build' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {habitDetails.type === 'build' ? 'Build' : 'Break'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits to manage</h3>
            <p className="text-gray-600 mb-6">You don't have any habits yet. Create some habits first to use this feature.</p>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🔄 When to Reset vs Delete</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Reset Habits When:</h4>
              <ul className="space-y-1 text-xs">
                <li>• You want a fresh start with the same habit</li>
                <li>• Your routine has changed significantly</li>
                <li>• You've had a long break and want to restart</li>
                <li>• You want to clear old data but keep the habit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Delete Habits When:</h4>
              <ul className="space-y-1 text-xs">
                <li>• The habit is no longer relevant</li>
                <li>• You've permanently achieved the goal</li>
                <li>• You want to completely remove it</li>
                <li>• You're decluttering your habit list</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}