import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { UserHabit } from "../entities/UserHabit";
import { Habit } from "../entities/Habit";
import { HabitLog } from "../entities/HabitLog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Flame, 
  CheckCircle,
  Award,
  Clock
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [loading, setLoading] = useState(true);

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
      
      const logsData = await HabitLog.list(currentUser.uid, 'date', 'desc');
      const myHabitIds = userHabitsData.map(h => h.id);
      const myLogs = logsData.filter(log => myHabitIds.includes(log.user_habit_id));
      setHabitLogs(myLogs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getHabitDetails = (userHabitId) => {
    const userHabit = userHabits.find(uh => uh.id === userHabitId);
    if (!userHabit) return null;
    return habits.find(h => h.id === userHabit.habit_id);
  };

  const getUserHabitDetails = (userHabitId) => {
    return userHabits.find(uh => uh.id === userHabitId);
  };

  const getFilteredLogs = () => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = subDays(new Date(), days - 1);
    return habitLogs.filter(log => new Date(log.date) >= cutoffDate);
  };

  const getFilteredUserHabits = () => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = subDays(new Date(), days - 1);
    return userHabits.filter(uh => new Date(uh.start_date) <= cutoffDate);
  };

  // Calculate stats for selected period
  const filteredLogs = getFilteredLogs();
  const filteredUserHabits = getFilteredUserHabits();
  const totalHabits = filteredUserHabits.length;
  const activeHabits = filteredUserHabits.filter(h => h.status === 'active').length;
  const completedHabits = filteredUserHabits.filter(h => h.status === 'completed').length;
  const totalCompletions = filteredLogs.filter(log => log.completed).length;
  const currentStreak = totalHabits > 0 ? Math.max(...filteredUserHabits.map(h => h.streak_current || 0), 0) : 0;
  const longestStreak = totalHabits > 0 ? Math.max(...filteredUserHabits.map(h => h.streak_longest || 0), 0) : 0;

  // Generate daily completion rate data
  const getDailyCompletionRateData = () => {
    const days = parseInt(selectedPeriod);
    const dateRange = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dateRange.push(date);
    }
    
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const activeHabitsOnDate = filteredUserHabits.filter(uh => 
        new Date(uh.start_date) <= date && 
        (uh.status === 'active' || new Date(uh.start_date) <= date)
      ).length;
      
      const completedOnDate = filteredLogs.filter(log => 
        log.date === dateStr && log.completed
      ).length;
      
      const completionRate = activeHabitsOnDate > 0 ? (completedOnDate / activeHabitsOnDate) * 100 : 0;
      
      return {
        date: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        completionRate: Math.round(completionRate),
        completed: completedOnDate,
        total: activeHabitsOnDate
      };
    });
  };

  // Generate weekly completion data
  const getWeeklyData = () => {
    const days = parseInt(selectedPeriod);
    const dateRange = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dateRange.push(date);
    }
    
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLogs = filteredLogs.filter(log => log.date === dateStr && log.completed);
      return {
        day: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        completions: dayLogs.length,
        date: dateStr
      };
    });
  };

  // Generate habit completion distribution
  const getHabitDistribution = () => {
    const distribution = {};
    
    filteredUserHabits.forEach(userHabit => {
      const habitDetails = getHabitDetails(userHabit.id);
      if (habitDetails) {
        const completions = filteredLogs.filter(log => 
          log.user_habit_id === userHabit.id && log.completed
        ).length;
        
        distribution[habitDetails.title] = completions;
      }
    });
    
    return Object.entries(distribution)
      .filter(([name, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
  };

  // Generate individual habit progress data
  const getIndividualHabitProgress = () => {
    return filteredUserHabits.map(userHabit => {
      const habitDetails = getHabitDetails(userHabit.id);
      const habitLogs = filteredLogs.filter(log => log.user_habit_id === userHabit.id && log.completed);
      const startDate = new Date(userHabit.start_date);
      const endDate = new Date();
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const completionRate = totalDays > 0 ? Math.round((habitLogs.length / totalDays) * 100) : 0;
      
      return {
        userHabit,
        habitDetails,
        currentStreak: userHabit.streak_current || 0,
        longestStreak: userHabit.streak_longest || 0,
        totalCompletions: userHabit.total_completions || 0,
        completionRate,
        completionsInPeriod: habitLogs.length
      };
    });
  };

  const dailyCompletionRateData = getDailyCompletionRateData();
  const weeklyData = getWeeklyData();
  const habitDistribution = getHabitDistribution();
  const individualProgress = getIndividualHabitProgress();

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
          <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
          <p className="text-gray-600 mt-2">Track your habit-building journey</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalHabits}</div>
            <div className="text-sm text-gray-600">Total Habits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalCompletions}</div>
            <div className="text-sm text-gray-600">Total Completions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{longestStreak}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </CardContent>
        </Card>
      </div>

      {totalHabits > 0 ? (
        <>
          {/* Daily Completion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Daily Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCompletionRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Completion Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completions" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Habit Distribution */}
            {habitDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Habit Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={habitDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {habitDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Average Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Average Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {dailyCompletionRateData.length > 0 
                      ? Math.round(dailyCompletionRateData.reduce((sum, day) => sum + day.completionRate, 0) / dailyCompletionRateData.length)
                      : 0}%
                  </div>
                  <p className="text-gray-600">Average completion rate over {selectedPeriod} days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Habit Progress Boxes */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Habit Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {individualProgress.map(({ userHabit, habitDetails, currentStreak, longestStreak, totalCompletions, completionRate, completionsInPeriod }) => {
                  if (!habitDetails) return null;

                  return (
                    <Card key={userHabit.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{habitDetails.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{habitDetails.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {habitDetails.category}
                              </Badge>
                              <Badge className={`text-xs ${
                                habitDetails.type === 'build' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {habitDetails.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-semibold">{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{currentStreak}</div>
                              <div className="text-gray-600">Current Streak</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{longestStreak}</div>
                              <div className="text-gray-600">Best Streak</div>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Completions:</span>
                              <span className="font-medium">{totalCompletions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">In {selectedPeriod} days:</span>
                              <span className="font-medium">{completionsInPeriod}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No progress data yet</h3>
            <p className="text-gray-600 mb-6">Start tracking habits to see your progress analytics.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}