
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserHabit } from "@/entities/UserHabit";
import { Habit } from "@/entities/Habit";
import { HabitLog } from "@/entities/HabitLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Target, TrendingUp, Award, Flame, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfWeek, endOfWeek, parseISO, differenceInDays } from "date-fns";

export default function Progress() {
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [selectedHabit, setSelectedHabit] = useState("all");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userHabits.length > 0 && logs.length > 0) {
      generateWeeklyData();
    } else if (userHabits.length === 0) {
      // If no active habits, reset weeklyData to empty
      setWeeklyData([]);
    }
  }, [logs, userHabits, selectedPeriod]);

  const loadData = async () => {
    try {
      const [userData, userHabitData, habitData, logData] = await Promise.all([
        User.me(),
        UserHabit.filter({ status: "active" }),
        Habit.list(),
        HabitLog.list("-date")
      ]);
      
      setUser(userData);
      
      // Filter user habits for current user
      const myHabits = userHabitData.filter(uh => uh.user_id === userData.id);
      setUserHabits(myHabits);
      setHabits(habitData);
      
      // Filter logs for user's habits only
      const myHabitIds = myHabits.map(uh => uh.id);
      const myLogs = logData.filter(log => myHabitIds.includes(log.user_habit_id));
      setLogs(myLogs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateWeeklyData = () => {
    const days = selectedPeriod === "7days" ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, "yyyy-MM-dd");
      
      // Only get logs for habits that existed on that day
      const dayLogs = logs.filter(log => log.date === dateString);
      
      const activeHabitsOnDay = userHabits.filter(uh => {
        const startDate = parseISO(uh.start_date);
        return startDate <= date;
      });
      
      const totalHabitsOnDay = activeHabitsOnDay.length;
      const completedHabitsCount = dayLogs.filter(log => log.completed).length;
      
      const completionRate = totalHabitsOnDay > 0 ? (completedHabitsCount / totalHabitsOnDay) * 100 : 0;
      
      data.push({
        date: format(date, "MMM dd"),
        fullDate: dateString,
        completed: completedHabitsCount,
        total: totalHabitsOnDay,
        completionRate: Math.round(completionRate)
      });
    }
    
    setWeeklyData(data);
  };

  const getHabitDetails = (habitId) => {
    return habits.find(h => h.id === habitId);
  };

  const calculateStats = () => {
    if (userHabits.length === 0) {
      return {
        totalHabits: 0,
        completionRate: 0,
        maxStreak: 0,
        avgStreak: 0,
        weeklyCompletionRate: 0
      };
    }

    const totalHabits = userHabits.length;
    const totalLogs = logs.length;
    const completedLogs = logs.filter(log => log.completed).length;
    const completionRate = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0;
    
    // Current streaks
    const currentStreaks = userHabits.map(uh => uh.streak_current || 0);
    const maxStreak = Math.max(...currentStreaks, 0);
    const avgStreak = currentStreaks.length > 0 ? currentStreaks.reduce((a, b) => a + b, 0) / currentStreaks.length : 0;
    
    // This week's performance
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const thisWeekLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });
    const thisWeekCompleted = thisWeekLogs.filter(log => log.completed).length;
    // Fix: This calculation should consider potential active habits, not just logged ones.
    const uniqueHabitsThisWeek = [...new Set(thisWeekLogs.map(l => l.user_habit_id))].length;
    const weeklyCompletionRate = uniqueHabitsThisWeek > 0 ? (thisWeekCompleted / (uniqueHabitsThisWeek * 7)) * 100 : 0; // Simplified
    
    return {
      totalHabits,
      completionRate: Math.round(completionRate),
      maxStreak,
      avgStreak: Math.round(avgStreak),
      weeklyCompletionRate: Math.round(weeklyCompletionRate) > 100 ? 100 : Math.round(weeklyCompletionRate)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your habit performance and consistency
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Habits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHabits}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Max Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maxStreak}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgStreak}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weeklyCompletionRate}%</p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Completion Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits Completed Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Habits Completed Daily
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Habits Completed']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Habit Progress Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Individual Habit Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {userHabits.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No active habits found. Add some habits to see your individual progress here!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userHabits.map((userHabit) => {
                  const habitDetails = getHabitDetails(userHabit.habit_id);
                  // Filter logs specific to this userHabit instance
                  const habitLogs = logs.filter(log => log.user_habit_id === userHabit.id);
                  const completedLogsCount = habitLogs.filter(log => log.completed).length;

                  const startDate = parseISO(userHabit.start_date);
                  const today = new Date();
                  const activeDays = differenceInDays(today, startDate) + 1;

                  const completionRate = activeDays > 0 ? (completedLogsCount / activeDays) * 100 : 0;
                  
                  return (
                    <div key={userHabit.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          habitDetails?.type === "build" 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}>
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{habitDetails?.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {habitDetails?.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Streak</span>
                          <span className="font-medium">{userHabit.streak_current || 0} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">{Math.round(completionRate)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Completions</span>
                          <span className="font-medium">{userHabit.total_completions || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
