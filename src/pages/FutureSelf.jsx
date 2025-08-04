import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { FutureLetter } from "../entities/FutureLetter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Mail, Calendar, Lock, Unlock, Clock } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";

export default function FutureSelf() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [letters, setLetters] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newLetter, setNewLetter] = useState({
    title: '',
    content: '',
    unlock_date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
      loadData().catch(console.error);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      if (!userData) {
        console.warn("User data is null, cannot load dependent data.");
        return;
      }
      setUser(userData);
      
      const letterData = await FutureLetter.filter({ user_id: userData.id });
      setLetters(letterData.sort((a, b) => new Date(a.unlock_date) - new Date(b.unlock_date)));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createLetter = async () => {
    if (!newLetter.title.trim() || !newLetter.content.trim() || !newLetter.unlock_date) {
      alert("Please fill in all fields.");
      return;
    }

    const unlockDate = new Date(newLetter.unlock_date);
    if (isBefore(unlockDate, new Date())) {
      alert("Unlock date must be in the future.");
      return;
    }

    try {
      await FutureLetter.create({
        ...newLetter,
        user_id: user.id
      });
      
      setNewLetter({
        title: '',
        content: '',
        unlock_date: ''
      });
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating letter:", error);
    }
  };

  const isLetterUnlocked = (letter) => {
    return isAfter(new Date(), new Date(letter.unlock_date)) || letter.is_unlocked;
  };

  const getTimeUntilUnlock = (unlockDate) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diffTime = unlock - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Available now";
    if (diffDays === 1) return "1 day remaining";
    if (diffDays < 30) return `${diffDays} days remaining`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months remaining`;
    return `${Math.ceil(diffDays / 365)} years remaining`;
  };

  const unlockedLetters = letters.filter(isLetterUnlocked);
  const lockedLetters = letters.filter(letter => !isLetterUnlocked(letter));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Future Self</h1>
          <p className="text-gray-600 mt-2">Write letters to your future self</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Write Letter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write a Letter to Your Future Self</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Letter Title</Label>
                <Input
                  id="title"
                  value={newLetter.title}
                  onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
                  placeholder="What's this letter about?"
                />
              </div>
              <div>
                <Label htmlFor="unlock_date">When should this be delivered?</Label>
                <Input
                  id="unlock_date"
                  type="date"
                  value={newLetter.unlock_date}
                  onChange={(e) => setNewLetter({ ...newLetter, unlock_date: e.target.value })}
                  min={format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <Label htmlFor="content">Your Message</Label>
                <Textarea
                  id="content"
                  value={newLetter.content}
                  onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
                  placeholder="Dear Future Me,

What do you want to tell your future self? Share your current thoughts, dreams, challenges, or advice..."
                  rows={12}
                  className="resize-none"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Writing Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share what's happening in your life right now</li>
                  <li>• Write about your current goals and dreams</li>
                  <li>• Ask questions you'd like your future self to reflect on</li>
                  <li>• Include advice or encouragement for tough times</li>
                  <li>• Mention people who are important to you today</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createLetter}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send to Future
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{letters.length}</div>
            <div className="text-sm text-gray-600">Total Letters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Unlock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{unlockedLetters.length}</div>
            <div className="text-sm text-gray-600">Available to Read</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{lockedLetters.length}</div>
            <div className="text-sm text-gray-600">Waiting to Unlock</div>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Letters */}
      {unlockedLetters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-green-600" />
            Available Letters
          </h2>
          <div className="space-y-4">
            {unlockedLetters.map((letter) => (
              <Card key={letter.id} className="bg-green-50 border-green-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{letter.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Delivered on {format(new Date(letter.unlock_date), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {letter.content}
                    </p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 italic">
                    — From your past self ❤️
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Letters */}
      {lockedLetters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-600" />
            Waiting to Unlock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedLetters.map((letter) => (
              <Card key={letter.id} className="bg-orange-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {letter.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Unlocks on {format(new Date(letter.unlock_date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-orange-600 font-medium">
                        <Clock className="w-4 h-4" />
                        {getTimeUntilUnlock(letter.unlock_date)}
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Your letter is safely stored and will be revealed when the time comes.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {letters.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No letters yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your journey of self-reflection by writing your first letter to your future self. 
              It's a powerful way to track your growth and remind yourself of your dreams.
            </p>
            <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Letter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How Future Self Works</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>📝 Write heartfelt letters to your future self</p>
            <p>🔒 Letters are locked until your chosen date</p>
            <p>📬 Get surprised by your past thoughts and wisdom</p>
            <p>🌱 Track your personal growth over time</p>
            <p>💭 Reflect on how your perspectives have changed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}