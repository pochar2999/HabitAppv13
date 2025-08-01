import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { DailyReflection } from "../entities/DailyReflection";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Sun, Calendar, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { format, subDays, addDays } from "date-fns";

const reflectionQuestions = [
  {
    key: 'went_well',
    question: 'What went well today?',
    placeholder: 'Think about your accomplishments, positive moments, or things you\'re proud of...',
    emoji: '✨'
  },
  {
    key: 'went_better',
    question: 'What could have gone better?',
    placeholder: 'Consider challenges you faced or areas for improvement...',
    emoji: '🔄'
  },
  {
    key: 'learned',
    question: 'What did you learn today?',
    placeholder: 'New insights, skills, or realizations...',
    emoji: '💡'
  },
  {
    key: 'felt',
    question: 'How did you feel today?',
    placeholder: 'Describe your emotions, energy levels, or overall mood...',
    emoji: '💭'
  }
];

export default function UnpackDay() {
  const [user, setUser] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentReflection, setCurrentReflection] = useState(null);
  const [answers, setAnswers] = useState({
    went_well: '',
    went_better: '',
    learned: '',
    felt: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadReflectionForDate(selectedDate);
  }, [selectedDate, reflections]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const reflectionData = await DailyReflection.filter({ user_id: userData.id });
      setReflections(reflectionData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const loadReflectionForDate = (date) => {
    const reflection = reflections.find(r => r.date === date);
    if (reflection) {
      setCurrentReflection(reflection);
      setAnswers(reflection.answers || {
        went_well: '',
        went_better: '',
        learned: '',
        felt: ''
      });
    } else {
      setCurrentReflection(null);
      setAnswers({
        went_well: '',
        went_better: '',
        learned: '',
        felt: ''
      });
    }
  };

  const saveReflection = async () => {
    if (!user) return;

    // Check if at least one answer is provided
    const hasContent = Object.values(answers).some(answer => answer.trim() !== '');
    if (!hasContent) {
      alert("Please provide at least one reflection before saving.");
      return;
    }

    setSaving(true);
    try {
      const reflectionData = {
        user_id: user.id,
        date: selectedDate,
        answers: answers
      };

      if (currentReflection) {
        await DailyReflection.update(currentReflection.id, reflectionData);
      } else {
        await DailyReflection.create(reflectionData);
      }

      loadData(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving reflection:", error);
      alert("Error saving reflection. Please try again.");
    }
    setSaving(false);
  };

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1);
    
    // Don't allow future dates
    if (newDate > new Date()) return;
    
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const goToToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = new Date(selectedDate) > new Date();
  const hasReflection = currentReflection !== null;
  const completedReflections = reflections.length;
  const currentStreak = calculateStreak();

  function calculateStreak() {
    if (reflections.length === 0) return 0;
    
    const sortedReflections = reflections
      .map(r => r.date)
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedReflections.length; i++) {
      const reflectionDate = new Date(sortedReflections[i]);
      const expectedDate = subDays(currentDate, i);
      
      if (format(reflectionDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sun className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">Unpack My Day</h1>
        </div>
        <p className="text-gray-600">Daily reflection and mindfulness practice</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedReflections}</div>
            <div className="text-sm text-gray-600">Total Reflections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sun className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {isToday ? 'Today' : format(new Date(selectedDate), 'MMM d')}
            </div>
            <div className="text-sm text-gray-600">Selected Date</div>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigateDate('prev')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Day
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                {hasReflection && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {isToday && (
                  <Badge className="bg-blue-100 text-blue-800">Today</Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isToday && (
                <Button
                  variant="outline"
                  onClick={goToToday}
                  className="text-blue-600"
                >
                  Today
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigateDate('next')}
                disabled={isFutureDate}
                className="flex items-center gap-2"
              >
                Next Day
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflection Questions */}
      <div className="space-y-6">
        {reflectionQuestions.map((question, index) => (
          <Card key={question.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{question.emoji}</span>
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={answers[question.key]}
                onChange={(e) => setAnswers(prev => ({
                  ...prev,
                  [question.key]: e.target.value
                }))}
                placeholder={question.placeholder}
                rows={4}
                className="resize-none"
                disabled={isFutureDate}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      {!isFutureDate && (
        <div className="flex justify-center">
          <Button
            onClick={saveReflection}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                {hasReflection ? 'Update Reflection' : 'Save Reflection'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-orange-900 mb-3">Why Daily Reflection Matters</h3>
          <div className="space-y-2 text-sm text-orange-800">
            <p>🧠 <strong>Self-awareness:</strong> Understand your patterns and behaviors</p>
            <p>📈 <strong>Growth:</strong> Learn from both successes and challenges</p>
            <p>😌 <strong>Mindfulness:</strong> Stay present and intentional</p>
            <p>🎯 <strong>Clarity:</strong> Gain perspective on what truly matters</p>
            <p>💪 <strong>Resilience:</strong> Build emotional intelligence and coping skills</p>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 italic">
              "The unexamined life is not worth living." - Socrates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}