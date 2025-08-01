import React, { useState, useEffect } from 'react';
import { Idea } from '@/entities/Idea';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowLeft, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categories = ["Startup", "Personal Project", "Creative", "Life Improvement", "Other"];
const statuses = ["Backlog", "Researching", "In Progress", "Launched", "Archived"];

export default function IdeaVault() {
  const [ideas, setIdeas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const ideaData = await Idea.filter({ user_id: userData.id });
        setIdeas(ideaData);
      } catch (error) {
        console.error("Error loading ideas:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentIdea({ category: 'Startup', status: 'Backlog' });
    setShowDialog(true);
  };

  const openEditDialog = (idea) => {
    setIsEditing(true);
    setCurrentIdea(idea);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!currentIdea || !currentIdea.title) return alert("Idea title cannot be empty.");

    try {
      if (isEditing) {
        await Idea.update(currentIdea.id, currentIdea);
      } else {
        await Idea.create({ ...currentIdea, user_id: user.id });
      }
      const ideaData = await Idea.filter({ user_id: user.id });
      setIdeas(ideaData);
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving idea:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this idea?")) return;
    await Idea.delete(id);
    setIdeas(ideas.filter(i => i.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Idea Vault</h1>
            <p className="text-gray-600 mt-1">Capture, cultivate, and create. Your best ideas live here.</p>
          </div>
        </div>
        <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Add Idea</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map(idea => (
          <Card key={idea.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-700">{idea.description}</p>
            </CardContent>
            <div className="p-4 border-t space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Category:</span>
                <span>{idea.category}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Status:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{idea.status}</span>
              </div>
               <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(idea)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(idea.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
        {ideas.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-8">No ideas yet. What's on your mind?</p>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Idea</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" value={currentIdea?.title || ''} onChange={e => setCurrentIdea({...currentIdea, title: e.target.value})} /></div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" value={currentIdea?.description || ''} onChange={e => setCurrentIdea({...currentIdea, description: e.target.value})} /></div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={currentIdea?.category || ''} onValueChange={value => setCurrentIdea({...currentIdea, category: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={currentIdea?.status || ''} onValueChange={value => setCurrentIdea({...currentIdea, status: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
