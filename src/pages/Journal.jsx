import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { JournalEntry } from "../entities/JournalEntry";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, BookOpen, Calendar, Search, Edit, Trash2, Smile, Meh, Frown } from "lucide-react";
import { format } from "date-fns";

const moodEmojis = {
  very_happy: { emoji: "😄", label: "Very Happy", color: "text-green-600" },
  happy: { emoji: "😊", label: "Happy", color: "text-green-500" },
  neutral: { emoji: "😐", label: "Neutral", color: "text-gray-500" },
  sad: { emoji: "😔", label: "Sad", color: "text-orange-500" },
  very_sad: { emoji: "😢", label: "Very Sad", color: "text-red-500" }
};

export default function Journal() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const entryData = await JournalEntry.filter({ created_by: userData.email });
      setEntries(entryData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    try {
      const entryToCreate = {
        ...newEntry,
        tags: newEntry.tags.filter(tag => tag.trim() !== '')
      };

      if (editingEntry) {
        await JournalEntry.update(editingEntry.id, entryToCreate);
      } else {
        await JournalEntry.create(entryToCreate);
      }

      setNewEntry({
        title: '',
        content: '',
        mood: 'neutral',
        tags: []
      });
      setEditingEntry(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const deleteEntry = async (id) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await JournalEntry.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || []
    });
    setShowDialog(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-2">Reflect on your thoughts and experiences</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingEntry(null);
            setNewEntry({
              title: '',
              content: '',
              mood: 'neutral',
              tags: []
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your thoughts here..."
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="mood">How are you feeling?</Label>
                <Select value={newEntry.mood} onValueChange={(value) => setNewEntry({ ...newEntry, mood: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(moodEmojis).map(([key, mood]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newEntry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createEntry}>
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {Object.entries(moodEmojis).map(([key, mood]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {entries.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).length}
            </div>
            <div className="text-sm text-gray-600">Today's Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Smile className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {entries.filter(e => e.mood === 'happy' || e.mood === 'very_happy').length}
            </div>
            <div className="text-sm text-gray-600">Happy Entries</div>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const mood = moodEmojis[entry.mood] || moodEmojis.neutral;
            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl ${mood.color}`}>{mood.emoji}</span>
                        <div>
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {format(new Date(entry.date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {entries.length === 0 ? 'No journal entries yet' : 'No entries match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {entries.length === 0 
                ? 'Start journaling to capture your thoughts and experiences.'
                : 'Try adjusting your search terms or mood filter.'
              }
            </p>
            {entries.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}