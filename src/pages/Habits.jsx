import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
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
import { 
  Target, 
  Plus, 
  Flame, 
  Calendar, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Settings,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export default function Habits() {
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userHabitsData = await UserHabit.filter({ 
        user_id: userData.id, 
        status: "active" 
      });
      setUserHabits(userHabitsData);
      
      const habitsData = await Habit.list();
      setHabits(habitsData);
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const allTodayLogs = await HabitLog.filter({ date: todayStr });
      
      const myHabitIds = userHabitsData.map(h => h.id);
      const myTodayLogs = allTodayLogs.filter(log => myHabitIds.includes(log.user_habit_id));
      setTodayLogs(myTodayLogs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const toggleHabitCompletion = async (userHabit) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const existingLog = todayLogs.find(log => 
      log.user_habit_id === userHabit.id && log.date === todayStr
    );

    try {
      if (existingLog) {
        await HabitLog.update(existingLog.id, { completed: !existingLog.completed });
      } else {
        await HabitLog.create({
          user_habit_id: userHabit.id,
          date: todayStr,
          completed: true
        });
      }
      loadData();
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  const deleteHabit = async (userHabitId) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await UserHabit.delete(userHabitId);
        loadData();
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
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
        <Link to={createPageUrl("HabitSelect")}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </Link>
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

      {/* Habits List */}
      {totalHabits > 0 ? (
        <div className="space-y-4">
          {userHabits.map((userHabit) => {
            const habitDetails = getHabitDetails(userHabit);
            const isCompleted = isHabitCompletedToday(userHabit);
            
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
    </div>
  );
}