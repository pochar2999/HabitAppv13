import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Habit } from "../entities/Habit";
import { UserHabit } from "../entities/UserHabit";
import { User } from "../entities/User";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft, Clock, Target, Lightbulb, CheckCircle } from "lucide-react";

export default function HabitDetail() {
  const { currentUser } = useAuth();
  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, []);
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      setUser(userData);
      
      // Get habit ID from URL params (in a real app, you'd use useParams)
      const urlParams = new URLSearchParams(window.location.search);
      const habitId = urlParams.get('id');
      
      if (habitId) {
        const habitData = await Habit.get(habitId);
        setHabit(habitData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleStartHabit = () => {
    if (habit) {
      navigate(createPageUrl(`HabitForm?habitId=${habit.id}`));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Habit not found</h1>
        <Button onClick={() => navigate(createPageUrl("HabitSelect"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Habit Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl("HabitSelect"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{habit.title}</h1>
          <p className="text-gray-600 mt-1">{habit.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{habit.icon}</span>
                {habit.title}
                <Badge className={`ml-2 ${habit.type === 'build' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {habit.type === 'build' ? 'Build' : 'Break'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{habit.description}</p>
            </CardContent>
          </Card>

          {habit.benefits && habit.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {habit.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {habit.techniques && habit.techniques.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Techniques & Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {habit.techniques.map((technique, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{technique.name}</h4>
                    <p className="text-gray-700 mt-1">{technique.description}</p>
                    {technique.scientific_backing && (
                      <p className="text-sm text-blue-600 mt-2 italic">
                        💡 {technique.scientific_backing}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category</span>
                <Badge variant="outline">{habit.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type</span>
                <Badge className={habit.type === 'build' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {habit.type === 'build' ? 'Build Habit' : 'Break Habit'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Begin your journey with this habit and track your progress.
              </p>
              <Button 
                onClick={handleStartHabit}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start This Habit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}