import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Habit } from "../entities/Habit";
import { UserHabit } from "../entities/UserHabit";
import { User } from "../entities/User";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft, Target, Clock, Calendar } from "lucide-react";

export default function HabitForm() {
  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    target_frequency: 'daily',
    custom_frequency: {
      days_per_week: 3,
      specific_days: []
    },
    reminder_enabled: true,
    reminder_time: '09:00',
    user_answers: {}
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const urlParams = new URLSearchParams(window.location.search);
      const habitId = urlParams.get('habitId');
      
      if (habitId) {
        const habitData = await Habit.get(habitId);
        setHabit(habitData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      user_answers: {
        ...prev.user_answers,
        [questionIndex]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!habit || !user) return;

    try {
      await UserHabit.create({
        habit_id: habit.id,
        user_id: user.id,
        ...formData
      });
      
      navigate(createPageUrl("Habits"));
    } catch (error) {
      console.error("Error creating user habit:", error);
    }
  };

  const renderQuestion = (question, index) => {
    const value = formData.user_answers[index] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Your answer..."
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Enter a number..."
          />
        );
      
      case 'time':
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleAnswerChange(index, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === 'true'}
              onCheckedChange={(checked) => handleAnswerChange(index, checked ? 'true' : 'false')}
            />
            <Label>Yes</Label>
          </div>
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Your answer..."
          />
        );
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl(`HabitDetail?id=${habit.id}`))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setup: {habit.title}</h1>
          <p className="text-gray-600 mt-1">Customize your habit preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            {habit.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{habit.description}</p>
        </CardContent>
      </Card>

      {habit.questions && habit.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {habit.questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-base font-medium">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderQuestion(question, index)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Frequency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How often do you want to do this habit?</Label>
            <Select 
              value={formData.target_frequency} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, target_frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target_frequency === 'custom' && (
            <div>
              <Label>Days per week</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={formData.custom_frequency.days_per_week}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  custom_frequency: {
                    ...prev.custom_frequency,
                    days_per_week: parseInt(e.target.value)
                  }
                }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Reminder Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.reminder_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminder_enabled: checked }))}
            />
            <Label>Enable daily reminders</Label>
          </div>

          {formData.reminder_enabled && (
            <div>
              <Label>Reminder time</Label>
              <Input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl(`HabitDetail?id=${habit.id}`))}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          <Target className="w-4 h-4 mr-2" />
          Start Habit
        </Button>
      </div>
    </div>
  );
}