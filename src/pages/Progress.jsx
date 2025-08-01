import React, { useState, useEffect } from "react";
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
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedHabit, setSelectedHabit] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userHabitsData = await UserHabit.filter({ user_id: userData.id });
      setUserHabits(userHabitsData);
      
      const habitsData = await Habit.list();
      setHabits(habitsData);
      
      const logsData = await HabitLog.list('-date');
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

  // Calculate stats
  const totalHabits = userHabits.length;
  const activeHabits = userHabits.filter(h => h.status === 'active').length;
  const completedHabits = userHabits.filter(h => h.status === 'completed').length;
  const totalCompletions = habitLogs.filter(log => log.completed).length;
  const currentStreak = totalHabits > 0 ? Math.max(...userHabits.map(h => h.streak_current || 0), 0) : 0;
  const longestStreak = totalHabits > 0 ? Math.max(...userHabits.map(h => h.streak_longest || 0), 0) : 0;

  // Generate weekly completion data
  const getWeeklyData = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayLogs = habitLogs.filter(log => log.date === dayStr && log.completed);
      return {
        day: format(day, 'EEE'),
        completions: dayLogs.length,
        date: dayStr
      };
    });
  };

  // Generate habit completion distribution
  const getHabitDistribution = () => {
    const distribution = {};
    
    userHabits.forEach(userHabit => {
      const habitDetails = getHabitDetails(userHabit.id);
      if (habitDetails) {
        const completions = habitLogs.filter(log => 
          log.user_habit_id === userHabit.id && log.completed
        ).length;
        
        distribution[habitDetails.title] = completions;
      }
    });
    
    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Generate streak data
  const getStreakData = () => {
    return userHabits.map(userHabit => {
      const habitDetails = getHabitDetails(userHabit.id);
      return {
        name: habitDetails?.title || 'Unknown',
        current: userHabit.streak_current || 0,
        longest: userHabit.streak_longest || 0
      };
    });
  };

  const weeklyData = getWeeklyData();
  const habitDistribution = getHabitDistribution();
  const streakData = getStreakData();

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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
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
          {/* Weekly Completion Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Completions
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
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

            {/* Streak Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Streak Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={streakData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="current" fill="#F59E0B" name="Current Streak" />
                    <Bar dataKey="longest" fill="#10B981" name="Longest Streak" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Individual Habit Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Habit Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userHabits.map(userHabit => {
                const habitDetails = getHabitDetails(userHabit.id);
                if (!habitDetails) return null;

                const completions = habitLogs.filter(log => 
                  log.user_habit_id === userHabit.id && log.completed
                ).length;
                
                const progressPercentage = userHabit.total_completions > 0 
                  ? Math.min((completions / (userHabit.total_completions + 10)) * 100, 100)
                  : 0;

                return (
                  <div key={userHabit.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{habitDetails.icon}</span>
                        <div>
                          <h4 className="font-medium">{habitDetails.title}</h4>
                          <p className="text-sm text-gray-500">
                            {completions} completions • {userHabit.streak_current || 0} day streak
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{habitDetails.category}</Badge>
                        <Badge className={
                          habitDetails.type === 'build' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }>
                          {habitDetails.type}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                );
              })}
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