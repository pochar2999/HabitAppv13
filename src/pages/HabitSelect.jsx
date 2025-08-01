import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Habit } from "../entities/Habit";
import { UserHabit } from "../entities/UserHabit";
import { User } from "../entities/User";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Target, ArrowLeft, Plus } from "lucide-react";

export default function HabitSelect() {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [habitType, setHabitType] = useState('build');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    
    // Get type from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'break') {
      setHabitType('break');
    }
  }, []);

  useEffect(() => {
    filterHabits();
  }, [habits, searchTerm, selectedCategory, habitType]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const habitData = await Habit.list();
      setHabits(habitData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filterHabits = () => {
    let filtered = habits.filter(habit => habit.type === habitType);
    
    if (searchTerm) {
      filtered = filtered.filter(habit =>
        habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(habit => habit.category === selectedCategory);
    }
    
    setFilteredHabits(filtered);
  };

  const handleHabitSelect = (habit) => {
    navigate(createPageUrl(`HabitDetail?id=${habit.id}`));
  };

  const categories = [...new Set(habits.map(habit => habit.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl("Home"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {habitType === 'build' ? 'Build a Habit' : 'Break a Habit'}
          </h1>
          <p className="text-gray-600 mt-1">
            {habitType === 'build' 
              ? 'Choose a positive habit to develop' 
              : 'Select a negative habit to overcome'
            }
          </p>
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2">
        <Button
          variant={habitType === 'build' ? 'default' : 'outline'}
          onClick={() => setHabitType('build')}
          className={habitType === 'build' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Plus className="w-4 h-4 mr-2" />
          Build Habits
        </Button>
        <Button
          variant={habitType === 'break' ? 'default' : 'outline'}
          onClick={() => setHabitType('break')}
          className={habitType === 'break' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <Target className="w-4 h-4 mr-2" />
          Break Habits
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit) => (
          <Card 
            key={habit.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
            onClick={() => handleHabitSelect(habit)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {habit.title}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 ${
                        habit.type === 'build' 
                          ? 'border-green-200 text-green-700' 
                          : 'border-red-200 text-red-700'
                      }`}
                    >
                      {habit.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed">
                {habit.description}
              </p>
              {habit.benefits && habit.benefits.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Key Benefits:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {habit.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">•</span>
                        {benefit}
                      </li>
                    ))}
                    {habit.benefits.length > 2 && (
                      <li className="text-gray-400">+{habit.benefits.length - 2} more...</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}
    </div>
  );
}