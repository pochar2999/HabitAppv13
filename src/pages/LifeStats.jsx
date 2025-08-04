import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { UserHabit } from "../entities/UserHabit";
import { HabitLog } from "../entities/HabitLog";
import { JournalEntry } from "../entities/JournalEntry";
import { Todo } from "../entities/Todo";
import { Goal } from "../entities/Goal";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  TrendingUp, 
  Target, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  Star,
  Flame,
  Award,
  Activity
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function LifeStats() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
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
      
      const userHabitsData = await UserHabit.filter(currentUser.uid);
      setUserHabits(userHabitsData);
      
      const logsData = await HabitLog.list(currentUser.uid, 'date', 'desc');
      const myHabitIds = userHabitsData.map(h => h.id);
      const myLogs = logsData.filter(log => myHabitIds.includes(log.user_habit_id));
      setHabitLogs(myLogs);
      
      const journalData = await JournalEntry.filter(currentUser.uid);
      setJournalEntries(journalData);
      
      const todoData = await Todo.filter(currentUser.uid);
      setTodos(todoData);
      
      const goalData = await Goal.filter(currentUser.uid);
      setGoals(goalData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Don't block the UI on error
    }
  };

  // Calculate overall stats
  const totalHabits = userHabits.length;
  const activeHabits = userHabits.filter(h => h.status === 'active').length;
  const completedHabits = userHabits.filter(h => h.status === 'completed').length;
  const totalHabitCompletions = habitLogs.filter(log => log.completed).length;
  const currentStreak = totalHabits > 0 ? Math.max(...userHabits.map(h => h.streak_current || 0), 0) : 0;
  const longestStreak = totalHabits > 0 ? Math.max(...userHabits.map(h => h.streak_longest || 0), 0) : 0;
  
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  
  const totalJournalEntries = journalEntries.length;
  const thisWeekEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = startOfWeek(new Date());
    return entryDate >= weekStart;
  }).length;

  // Generate weekly activity data
  const getWeeklyActivityData = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayHabitLogs = habitLogs.filter(log => log.date === dayStr && log.completed).length;
      const dayJournalEntries = journalEntries.filter(entry => entry.date === dayStr).length;
      const dayTodoCompletions = todos.filter(todo => 
        todo.completed && todo.updated_date && 
        format(new Date(todo.updated_date), 'yyyy-MM-dd') === dayStr
      ).length;
      
      return {
        day: format(day, 'EEE'),
        habits: dayHabitLogs,
        journal: dayJournalEntries,
        todos: dayTodoCompletions,
        total: dayHabitLogs + dayJournalEntries + dayTodoCompletions
      };
    });
  };

  // Generate productivity distribution
  const getProductivityDistribution = () => {
    return [
      { name: 'Habits', value: totalHabitCompletions, color: COLORS[0] },
      { name: 'Todos', value: completedTodos, color: COLORS[1] },
      { name: 'Goals', value: completedGoals, color: COLORS[2] },
      { name: 'Journal', value: totalJournalEntries, color: COLORS[3] }
    ].filter(item => item.value > 0);
  };

  // Generate mood distribution from journal entries
  const getMoodDistribution = () => {
    const moodCounts = journalEntries.reduce((acc, entry) => {
      const mood = entry.mood || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const moodLabels = {
      very_happy: 'Very Happy',
      happy: 'Happy',
      neutral: 'Neutral',
      sad: 'Sad',
      very_sad: 'Very Sad'
    };

    return Object.entries(moodCounts).map(([mood, count], index) => ({
      name: moodLabels[mood] || mood,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const weeklyActivityData = getWeeklyActivityData();
  const productivityDistribution = getProductivityDistribution();
  const moodDistribution = getMoodDistribution();

  // Calculate productivity score (0-100)
  const calculateProductivityScore = () => {
    const habitScore = totalHabits > 0 ? (totalHabitCompletions / (totalHabits * 30)) * 100 : 0; // Assuming 30 days
    const todoScore = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
    const goalScore = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    const journalScore = Math.min((totalJournalEntries / 30) * 100, 100); // Max 100 for 30+ entries
    
    return Math.round((habitScore + todoScore + goalScore + journalScore) / 4);
  };

  const productivityScore = calculateProductivityScore();

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
        <h1 className="text-3xl font-bold text-gray-900">Life Stats</h1>
        <p className="text-gray-600 mt-2">Your personal analytics and insights</p>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Activity className="w-12 h-12 text-blue-600" />
            <div>
              <div className="text-4xl font-bold text-gray-900">{productivityScore}</div>
              <div className="text-lg text-gray-600">Productivity Score</div>
            </div>
          </div>
          <Progress value={productivityScore} className="h-3 max-w-md mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Based on your habits, todos, goals, and journal activity
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{activeHabits}</div>
            <div className="text-sm text-gray-600">Active Habits</div>
            <div className="text-xs text-gray-500 mt-1">{totalHabitCompletions} completions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedTodos}</div>
            <div className="text-sm text-gray-600">Completed Todos</div>
            <div className="text-xs text-gray-500 mt-1">{pendingTodos} pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{activeGoals}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
            <div className="text-xs text-gray-500 mt-1">{completedGoals} completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalJournalEntries}</div>
            <div className="text-sm text-gray-600">Journal Entries</div>
            <div className="text-xs text-gray-500 mt-1">{thisWeekEntries} this week</div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900">{currentStreak}</div>
            <div className="text-lg text-gray-600">Current Streak</div>
            <div className="text-sm text-gray-500 mt-2">Keep it going!</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900">{longestStreak}</div>
            <div className="text-lg text-gray-600">Longest Streak</div>
            <div className="text-sm text-gray-500 mt-2">Personal best!</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="habits" stackId="a" fill="#3B82F6" name="Habits" />
              <Bar dataKey="journal" stackId="a" fill="#10B981" name="Journal" />
              <Bar dataKey="todos" stackId="a" fill="#F59E0B" name="Todos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Distribution */}
        {productivityDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Productivity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productivityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {productivityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievement Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalHabits}</div>
              <div className="text-sm text-gray-600">Total Habits Created</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalJournalEntries}</div>
              <div className="text-sm text-gray-600">Journal Entries</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{longestStreak}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}