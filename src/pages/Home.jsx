import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { User } from "../entities/User";
import { UserHabit } from "../entities/UserHabit";
import { HabitLog } from "../entities/HabitLog";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Flame,
  Calendar,
  CheckCircle,
  Plus,
  BarChart3,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Home() {
  const [user, setUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    weeklyProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const habits = await UserHabit.filter({ user_id: userData.id, status: "active" });
      setUserHabits(habits);
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const allTodayLogs = await HabitLog.filter({ date: todayStr });
      
      const myHabitIds = habits.map(h => h.id);
      const myTodayLogs = allTodayLogs.filter(log => myHabitIds.includes(log.user_habit_id));
      setTodayLogs(myTodayLogs);
      
      const completed = myTodayLogs.filter(log => log.completed).length;
      const totalActive = habits.length;
      const progressPercentage = totalActive > 0 ? (completed / totalActive) * 100 : 0;
      
      setStats({
        totalHabits: totalActive,
        completedToday: completed,
        currentStreak: totalActive > 0 ? Math.max(...habits.map(h => h.streak_current || 0), 0) : 0,
        weeklyProgress: progressPercentage
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const dailyProgressPercentage = stats.totalHabits > 0 
    ? (stats.completedToday / stats.totalHabits) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ready to build better habits and achieve your goals?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-10 transform translate-x-8 -translate-y-8"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalHabits}</div>
              <p className="text-sm text-gray-500">habits in progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full opacity-10 transform translate-x-8 -translate-y-8"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.completedToday}/{stats.totalHabits}
              </div>
              <p className="text-sm text-gray-500">completed today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full opacity-10 transform translate-x-8 -translate-y-8"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.currentStreak}</div>
              <p className="text-sm text-gray-500">days in a row</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full opacity-10 transform translate-x-8 -translate-y-8"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.weeklyProgress.toFixed(0)}%</div>
              <p className="text-sm text-gray-500">this week</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {stats.totalHabits > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {stats.completedToday} of {stats.totalHabits} habits completed
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {dailyProgressPercentage.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={dailyProgressPercentage} className="h-3" />
                <p className="text-sm text-gray-500">
                  {dailyProgressPercentage === 100 
                    ? "🎉 Perfect day! All habits completed!" 
                    : `${stats.totalHabits - stats.completedToday} habits left to complete today`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to={createPageUrl("HabitSelect?type=build")}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Build Habit</h3>
                <p className="text-gray-600">Start building positive habits that stick</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to={createPageUrl("HabitSelect?type=break")}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Break Habit</h3>
                <p className="text-gray-600">Overcome negative patterns and behaviors</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to={createPageUrl("Habits")}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">My Habits</h4>
                <p className="text-sm text-gray-600">Track and manage your habits</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link to={createPageUrl("Progress")}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Progress</h4>
                <p className="text-sm text-gray-600">View detailed analytics</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Link to={createPageUrl("Features")}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Features</h4>
                <p className="text-sm text-gray-600">Explore all tools</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}