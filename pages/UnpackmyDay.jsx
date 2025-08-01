
import React, { useState, useEffect } from 'react';
import { DailyReflection } from '@/entities/DailyReflection';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sun, Moon, ArrowLeft } from 'lucide-react'; // Added ArrowLeft import
import { format, parseISO, isToday } from 'date-fns';
import { Link } from "react-router-dom"; // Added Link import
import { createPageUrl } from "@/utils"; // Added createPageUrl import

const questions = [
    { key: 'went_well', prompt: "What went well today?" },
    { key: 'went_better', prompt: "What could have gone better?" },
    { key: 'learned', prompt: "What did I learn today?" },
    { key: 'felt', prompt: "How did I feel overall?" }
];

export default function UnpackDay() {
    const [reflections, setReflections] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentReflection, setCurrentReflection] = useState({ answers: {} });
    // Changed viewingDate to selectedDate and initialized as a Date object
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    // Check if a reflection for today already exists in the loaded data
    const hasTodayReflection = reflections.some(r => r.date === format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const reflectionData = await DailyReflection.filter({ user_id: userData.id });
                setReflections(reflectionData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (error) {
                console.error("Error loading reflections:", error);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handleAnswerChange = (key, value) => {
        setCurrentReflection(prev => ({
            ...prev,
            answers: { ...prev.answers, [key]: value }
        }));
    };

    const handleSave = async () => {
        const reflectionToSave = {
            date: format(new Date(), 'yyyy-MM-dd'), // Always saves for today
            answers: currentReflection.answers,
            user_id: user.id
        };
        await DailyReflection.create(reflectionToSave);
        const reflectionData = await DailyReflection.filter({ user_id: user.id });
        setReflections(reflectionData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setCurrentReflection({ answers: {} }); // Clear form after saving
    };

    if (loading) return <div>Loading...</div>;

    // displayedReflection now uses selectedDate
    const displayedReflection = reflections.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={createPageUrl("Features")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Unpack My Day</h1>
                        <p className="text-gray-600 mt-1">Reflect on your day, find clarity, and plan for tomorrow.</p>
                    </div>
                </div>
                <Input 
                    type="date" 
                    value={format(selectedDate, 'yyyy-MM-dd')} 
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                    className="w-48"
                />
            </div>

            {/* Conditional rendering based on selectedDate and existing reflections */}
            {isToday(selectedDate) && !hasTodayReflection ? (
                <Card>
                    <CardHeader><CardTitle>Today's Reflection</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map(q => (
                            <div key={q.key}>
                                <Label className="text-lg">{q.prompt}</Label>
                                <Textarea 
                                    value={currentReflection.answers[q.key] || ''}
                                    onChange={e => handleAnswerChange(q.key, e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        ))}
                        <div className="text-right">
                            <Button onClick={handleSave}>Save Reflection</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : displayedReflection ? (
                <Card>
                    <CardHeader><CardTitle>Reflection for {format(parseISO(displayedReflection.date), 'MMMM d, yyyy')}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map(q => (
                           <div key={q.key}>
                                <h3 className="font-semibold text-lg">{q.prompt}</h3>
                                <p className="text-gray-700 mt-1 p-4 bg-gray-50 rounded-md">{displayedReflection.answers[q.key] || 'No answer.'}</p>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No reflection found for this date.</p>
                </div>
            )}
        </div>
    );
}
