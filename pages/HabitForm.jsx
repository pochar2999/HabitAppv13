import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Habit } from "@/entities/Habit";
import { UserHabit } from "@/entities/UserHabit";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function HabitForm() {
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const habitId = urlParams.get("habitId");

  useEffect(() => {
    loadData();
  }, [habitId]);

  const loadData = async () => {
    try {
      const [habitData, userData] = await Promise.all([
        Habit.list().then(habits => habits.find(h => h.id === habitId)),
        User.me()
      ]);
      
      setHabit(habitData);
      setUser(userData);
      
      // Initialize answers with defaults
      const initialAnswers = {};
      habitData.questions?.forEach(question => {
        if (question.type === "boolean") {
          initialAnswers[question.question] = false;
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create user habit
      await UserHabit.create({
        habit_id: habitId,
        user_id: user.id,
        start_date: format(new Date(), "yyyy-MM-dd"),
        user_answers: answers,
        status: "active"
      });
      
      navigate(createPageUrl("Habits"));
    } catch (error) {
      console.error("Error creating habit:", error);
    }
    
    setSaving(false);
  };

  const renderQuestion = (question, index) => {
    const value = answers[question.question] || "";
    
    switch (question.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.question, e.target.value)}
            placeholder="Enter your answer"
            required={question.required}
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.question, parseInt(e.target.value))}
            placeholder="Enter a number"
            required={question.required}
          />
        );
      
      case "time":
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => handleAnswerChange(question.question, e.target.value)}
            required={question.required}
          />
        );
      
      case "select":
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleAnswerChange(question.question, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`question-${index}`}
              checked={value}
              onCheckedChange={(checked) => handleAnswerChange(question.question, checked)}
            />
            <Label htmlFor={`question-${index}`}>Yes</Label>
          </div>
        );
      
      default:
        return null;
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
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Habit not found</h3>
        <Button onClick={() => navigate(createPageUrl("Home"))}>
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Habit</h1>
          <p className="text-gray-600 mt-1">
            Let's customize "{habit.title}" to fit your lifestyle
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Habit Setup Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {habit.questions?.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <Label className="text-base font-medium text-gray-900">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderQuestion(question, index)}
                </motion.div>
              ))}
              
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Ready to start your habit journey?</p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Start Habit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
