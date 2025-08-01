import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Habit } from "@/entities/Habit";
import { UserHabit } from "@/entities/UserHabit";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Target,
  Lightbulb,
  Star,
  CheckCircle,
  Check,
  Plus,
  Info,
  Heart,
  Zap,
  Brain,
  Users,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

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

export default function HabitDetail() {
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const habitId = urlParams.get('id');

  useEffect(() => {
    if (habitId) {
      loadData();
    }
  }, [habitId]);

  const loadData = async () => {
    try {
      const [habitData, userData] = await Promise.all([
        Habit.get(habitId), // Use get() for a single record
        User.me()
      ]);
      
      setHabit(habitData);
      setUser(userData);

      // Initialize answers state
      if (habitData?.questions) {
        const initialAnswers = {};
        habitData.questions.forEach((q, index) => {
          initialAnswers[`question_${index}`] = '';
        });
        setAnswers(initialAnswers);
      }

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };
  
  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value
    }));
  };

  const handleAddHabit = async () => {
    if (!habit || !user) return;
    
    setSaving(true);
    try {
      await UserHabit.create({
        habit_id: habit.id,
        user_id: user.id,
        status: "active",
        start_date: format(new Date(), "yyyy-MM-dd"),
        user_answers: answers,
        streak_current: 0,
        streak_longest: 0,
        total_completions: 0,
        reminder_enabled: true
      });
      
      navigate(createPageUrl("Habits"));
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("There was an error adding this habit. Please try again.");
    }
    setSaving(false);
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
      <div className="max-w-4xl mx-auto text-center py-10">
        <h1 className="text-2xl font-bold">Habit not found</h1>
        <p className="text-gray-600">This habit might have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const Icon = categoryIcons[habit.category] || Target;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{habit.title}</h1>
        <Badge variant="secondary" className="capitalize text-base">
          <Icon className="w-4 h-4 mr-2"/>
          {habit.category}
        </Badge>
      </div>

      {/* Overview & Add Button */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{habit.description}</p>
          <div className="flex justify-end">
             <Button onClick={handleAddHabit} disabled={saving}>
              {saving ? "Adding..." : <><Plus className="w-4 h-4 mr-2" /> Add to My Habits</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Questions */}
      {habit.questions && habit.questions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Customize Your Habit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {habit.questions.map((q, index) => (
              <div key={index} className="space-y-2">
                <Label>{q.question}</Label>
                {q.type === "select" ? (
                  <Select onValueChange={(value) => handleAnswerChange(index, value)}>
                    <SelectTrigger><SelectValue placeholder="Select an option..." /></SelectTrigger>
                    <SelectContent>
                      {q.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    type={q.type} 
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb /> Science-Backed Techniques</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {habit.techniques?.map((tech, i) => (
              <div key={i}>
                <h4 className="font-semibold">{tech.name}</h4>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star /> Benefits</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {habit.benefits?.map((benefit, i) => <li key={i}>{benefit}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info /> Success Tips</CardTitle></CardHeader>
          <CardContent>
             <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Start Small:</strong> Don't try to change everything at once. Focus on one habit at a time.</li>
                <li><strong>Be Consistent:</strong> Consistency is more important than intensity. Show up every day.</li>
                <li><strong>Track Your Progress:</strong> Use this app to log your completions and watch your streaks grow.</li>
                <li><strong>Don't Break the Chain:</strong> Try not to miss a day. If you do, get back on track immediately.</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
