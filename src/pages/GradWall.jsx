import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { GratitudeEntry } from "../entities/GratitudeEntry";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Heart, Calendar, Trash2, Smile } from "lucide-react";
import { format } from "date-fns";

const stickyNoteColors = {
  yellow: 'bg-yellow-200 border-yellow-300 text-yellow-900',
  pink: 'bg-pink-200 border-pink-300 text-pink-900',
  blue: 'bg-blue-200 border-blue-300 text-blue-900',
  green: 'bg-green-200 border-green-300 text-green-900',
  purple: 'bg-purple-200 border-purple-300 text-purple-900',
  orange: 'bg-orange-200 border-orange-300 text-orange-900'
};

export default function GratitudeWall() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: '',
    color: 'yellow'
  });
  const [selectedColor, setSelectedColor] = useState('all');
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
      
      const entryData = await GratitudeEntry.filter({ user_id: userData.id });
      setEntries(entryData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createEntry = async () => {
    if (!newEntry.content.trim()) {
      alert("Please write what you're grateful for.");
      return;
    }

    try {
      await GratitudeEntry.create({
        ...newEntry,
        user_id: user.id
      });
      
      setNewEntry({
        content: '',
        color: 'yellow'
      });
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  const deleteEntry = async (id) => {
    if (confirm("Are you sure you want to delete this gratitude entry?")) {
      try {
        await GratitudeEntry.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const filteredEntries = selectedColor === 'all' 
    ? entries 
    : entries.filter(entry => entry.color === selectedColor);

  const todayEntries = entries.filter(entry => 
    entry.date === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const thisWeekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return entryDate >= weekStart;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gratitude Wall</h1>
          <p className="text-gray-600 mt-2">Practice gratitude and appreciate life's blessings</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Gratitude
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>What are you grateful for?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Your gratitude</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="I'm grateful for..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <Label htmlFor="color">Sticky note color</Label>
                <Select value={newEntry.color} onValueChange={(value) => setNewEntry({ ...newEntry, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">💛 Yellow</SelectItem>
                    <SelectItem value="pink">💗 Pink</SelectItem>
                    <SelectItem value="blue">💙 Blue</SelectItem>
                    <SelectItem value="green">💚 Green</SelectItem>
                    <SelectItem value="purple">💜 Purple</SelectItem>
                    <SelectItem value="orange">🧡 Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createEntry} className="bg-pink-600 hover:bg-pink-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Wall
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
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-sm text-gray-600">Total Gratitudes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Smile className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{todayEntries}</div>
            <div className="text-sm text-gray-600">Today's Gratitudes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{thisWeekEntries}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Color Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by color:</Label>
        <Select value={selectedColor} onValueChange={setSelectedColor}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            <SelectItem value="yellow">💛 Yellow</SelectItem>
            <SelectItem value="pink">💗 Pink</SelectItem>
            <SelectItem value="blue">💙 Blue</SelectItem>
            <SelectItem value="green">💚 Green</SelectItem>
            <SelectItem value="purple">💜 Purple</SelectItem>
            <SelectItem value="orange">🧡 Orange</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gratitude Wall */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`
                ${stickyNoteColors[entry.color] || stickyNoteColors.yellow}
                p-4 rounded-lg border-2 shadow-sm hover:shadow-md transition-all
                transform hover:-rotate-1 cursor-pointer relative group
                min-h-[150px] flex flex-col
              `}
              style={{
                transform: `rotate(${Math.random() * 4 - 2}deg)`,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEntry(entry.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-100 p-1 h-auto"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              
              <div className="flex-1">
                <p className="text-sm leading-relaxed font-medium">
                  {entry.content}
                </p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-current border-opacity-20">
                <div className="flex items-center justify-between text-xs opacity-75">
                  <span>{format(new Date(entry.date), 'MMM d')}</span>
                  <Heart className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {entries.length === 0 ? 'Your gratitude wall is empty' : 'No entries match your filter'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {entries.length === 0 
                ? 'Start your gratitude practice by adding what you\'re thankful for today.'
                : 'Try selecting a different color filter to see more entries.'
              }
            </p>
            {entries.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Gratitude
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits Card */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-pink-900 mb-3">💖 Benefits of Gratitude Practice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-pink-800">
            <div>
              <h4 className="font-medium mb-2">Mental Health:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Reduces stress and anxiety</li>
                <li>• Improves mood and happiness</li>
                <li>• Enhances self-esteem</li>
                <li>• Promotes better sleep</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Relationships:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Strengthens social bonds</li>
                <li>• Increases empathy</li>
                <li>• Improves communication</li>
                <li>• Builds trust and connection</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
            <p className="text-sm text-pink-700 italic">
              "Gratitude turns what we have into enough." - Anonymous
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}