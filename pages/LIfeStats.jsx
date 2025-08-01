
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { UserHabit } from '@/entities/UserHabit';
import { Todo } from '@/entities/Todo';
import { Goal } from '@/entities/Goal';
import { JournalEntry } from '@/entities/JournalEntry';
import { Badge as BadgeEntity } from '@/entities/Badge';
import { UserBadge } from '@/entities/UserBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Award, Target, CheckSquare, BookOpen, Star, Sparkles, Trophy, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button"; // Assuming Button component is from shadcn/ui

const levelThresholds = Array.from({ length: 50 }, (_, i) => (i + 1) * 100 * (1 + i * 0.1));

export default function LifeStats() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);

        const [userHabits, todos, goals, journalEntries, allBadges, myBadges] = await Promise.all([
          UserHabit.filter({ user_id: userData.id }),
          Todo.filter({ created_by: userData.email }),
          Goal.filter({ created_by: userData.email }),
          JournalEntry.filter({ created_by: userData.email }),
          BadgeEntity.list(),
          UserBadge.filter({ user_id: userData.id })
        ]);
        
        const habitsCompleted = userHabits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
        const longestStreak = Math.max(0, ...userHabits.map(h => h.streak_longest || 0));
        
        setStats({
          habitsCompleted,
          longestStreak,
          tasksCompleted: todos.filter(t => t.completed).length,
          goalsCompleted: goals.filter(g => g.status === 'completed').length,
          journalEntries: journalEntries.length,
        });

        const myBadgeIds = myBadges.map(b => b.badge_id);
        const ownedBadges = allBadges.filter(b => myBadgeIds.includes(b.id));
        setBadges(ownedBadges);

      } catch (error) {
        console.error("Error fetching life stats:", error);
      }
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading || !user || !stats) return <div>Loading Life Stats...</div>;

  const currentLevelXP = user.level > 1 ? levelThresholds[user.level - 2] : 0;
  const nextLevelXP = levelThresholds[user.level - 1];
  const xpForLevel = nextLevelXP - currentLevelXP;
  const xpInCurrentLevel = user.xp - currentLevelXP;
  const levelProgress = (xpInCurrentLevel / xpForLevel) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Features")}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Life Stats</h1>
      </div>

      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage src={user.profile_picture} />
            <AvatarFallback className="text-3xl bg-white text-purple-600">{user.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name}</h1>
            <p className="text-blue-200">Member since {format(new Date(user.created_date), 'MMMM yyyy')}</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold">Level {user.level}</p>
                <p className="text-sm">{user.xp} / {nextLevelXP} XP</p>
              </div>
              <Progress value={levelProgress} className="h-3 [&>*]:bg-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={Target} title="Habits Completed" value={stats.habitsCompleted} />
        <StatCard icon={Trophy} title="Longest Streak" value={`${stats.longestStreak} days`} />
        <StatCard icon={CheckSquare} title="Tasks Done" value={stats.tasksCompleted} />
        <StatCard icon={Star} title="Goals Achieved" value={stats.goalsCompleted} />
        <StatCard icon={BookOpen} title="Journal Entries" value={stats.journalEntries} />
      </div>

      <Card>
        <CardHeader><CardTitle>My Badges</CardTitle></CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="p-3 bg-yellow-100 rounded-full mb-2"><Award className="w-8 h-8 text-yellow-500" /></div>
                  <p className="font-semibold">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No badges earned yet. Keep going!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = ({ icon: Icon, title, value }) => (
  <Card>
    <CardContent className="p-6 text-center">
      <Icon className="w-10 h-10 mx-auto text-blue-500 mb-2"/>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </CardContent>
  </Card>
);
