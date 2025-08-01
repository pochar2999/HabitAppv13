
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Habit } from "@/entities/Habit";
import { UserHabit } from "@/entities/UserHabit";
import { User } from "@/entities/User";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Target, Zap, Heart, Brain, Users, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons = {
  health: Heart,
  productivity: Zap,
  mindfulness: Brain,
  social: Users,
  learning: GraduationCap,
  fitness: Target,
  nutrition: Heart,
  sleep: Brain,
  breaking: Target
};

const categoryColors = {
  health: "bg-green-100 text-green-800",
  productivity: "bg-blue-100 text-blue-800",
  mindfulness: "bg-purple-100 text-purple-800",
  social: "bg-pink-100 text-pink-800",
  learning: "bg-yellow-100 text-yellow-800",
  fitness: "bg-red-100 text-red-800",
  nutrition: "bg-orange-100 text-orange-800",
  sleep: "bg-indigo-100 text-indigo-800",
  breaking: "bg-gray-100 text-gray-800"
};

export default function HabitSelect() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const habitType = urlParams.get("type") || "build";

  useEffect(() => {
    loadHabits();
  }, [habitType]);

  useEffect(() => {
    filterHabits();
  }, [searchTerm, selectedCategory, habits]);

  const loadHabits = async () => {
    try {
      const userData = await User.me();
      const [allHabits, myUserHabits] = await Promise.all([
        Habit.filter({ type: habitType }),
        UserHabit.filter({ user_id: userData.id }),
      ]);

      const myHabitIds = myUserHabits.map(uh => uh.habit_id);
      
      const redundantTitles = [
        "Drink 8 Glasses of Water Daily",
        "Daily Exercise",
        "Morning Meditation",
        "Read for 30 Minutes Daily"
      ];

      const availableHabits = allHabits.filter(h => 
        !myHabitIds.includes(h.id) && !redundantTitles.includes(h.title)
      );
      
      setHabits(availableHabits);
      setFilteredHabits(availableHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
    }
    setLoading(false);
  };

  const filterHabits = () => {
    let filtered = habits;

    if (searchTerm) {
      filtered = filtered.filter(habit =>
        habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habit.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(habit => habit.category === selectedCategory);
    }

    setFilteredHabits(filtered);
  };

  const categories = [...new Set(habits.map(habit => habit.category))];

  const handleHabitClick = (habit) => {
    navigate(createPageUrl(`HabitDetail?id=${habit.id}`));
  };

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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {habitType === "build" ? "Build a Habit" : "Break a Habit"}
            </h1>
            <p className="text-gray-600 mt-1">
              Choose from science-backed habits to {habitType === "build" ? "develop" : "overcome"}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Target;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="capitalize"
              >
                <Icon className="w-4 h-4 mr-1" />
                {category}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit, index) => {
          const Icon = categoryIcons[habit.category] || Target;
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleHabitClick(habit)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        habitType === "build" 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                          : "bg-gradient-to-r from-red-500 to-pink-500"
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {habit.title}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`mt-1 ${categoryColors[habit.category]}`}
                        >
                          {habit.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {habit.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {habit.techniques?.length || 0} techniques
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {habit.benefits?.length || 0} benefits
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                      Learn more →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
