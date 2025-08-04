import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { Idea } from "../entities/Idea";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Lightbulb, Search, Edit, Trash2, Target, TrendingUp } from "lucide-react";

const categoryColors = {
  'Startup': 'bg-blue-100 text-blue-800 border-blue-200',
  'Personal Project': 'bg-green-100 text-green-800 border-green-200',
  'Creative': 'bg-purple-100 text-purple-800 border-purple-200',
  'Life Improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusColors = {
  'Backlog': 'bg-gray-100 text-gray-800',
  'Researching': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Launched': 'bg-green-100 text-green-800',
  'Archived': 'bg-red-100 text-red-800'
};

export default function IdeaVault() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'Personal Project',
    status: 'Backlog'
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
      
      const ideaData = await Idea.filter({ user_id: userData.id });
      setIdeas(ideaData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createIdea = async () => {
    if (!newIdea.title.trim()) {
      alert("Please enter an idea title.");
      return;
    }

    try {
      const ideaToSave = {
        ...newIdea,
        user_id: user.id
      };

      if (editingIdea) {
        await Idea.update(editingIdea.id, ideaToSave);
      } else {
        await Idea.create(ideaToSave);
      }

      setNewIdea({
        title: '',
        description: '',
        category: 'Personal Project',
        status: 'Backlog'
      });
      setEditingIdea(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving idea:", error);
    }
  };

  const deleteIdea = async (id) => {
    if (confirm("Are you sure you want to delete this idea?")) {
      try {
        await Idea.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting idea:", error);
      }
    }
  };

  const startEdit = (idea) => {
    setEditingIdea(idea);
    setNewIdea({
      title: idea.title,
      description: idea.description || '',
      category: idea.category,
      status: idea.status
    });
    setShowDialog(true);
  };

  const updateIdeaStatus = async (ideaId, newStatus) => {
    try {
      await Idea.update(ideaId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating idea status:", error);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || idea.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Object.keys(categoryColors);
  const statuses = Object.keys(statusColors);
  
  const categoryStats = categories.reduce((stats, category) => {
    stats[category] = ideas.filter(i => i.category === category).length;
    return stats;
  }, {});

  const statusStats = statuses.reduce((stats, status) => {
    stats[status] = ideas.filter(i => i.status === status).length;
    return stats;
  }, {});

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
          <h1 className="text-3xl font-bold text-gray-900">Idea Vault</h1>
          <p className="text-gray-600 mt-2">Capture and organize your creative ideas</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingIdea(null);
            setNewIdea({
              title: '',
              description: '',
              category: 'Personal Project',
              status: 'Backlog'
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingIdea ? 'Edit Idea' : 'Capture New Idea'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Idea Title</Label>
                <Input
                  id="title"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  placeholder="What's your idea?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  placeholder="Describe your idea in detail..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newIdea.category} onValueChange={(value) => setNewIdea({ ...newIdea, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newIdea.status} onValueChange={(value) => setNewIdea({ ...newIdea, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createIdea}>
                  {editingIdea ? 'Update Idea' : 'Save Idea'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{ideas.length}</div>
            <div className="text-sm text-gray-600">Total Ideas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{statusStats['In Progress'] || 0}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{statusStats['Launched'] || 0}</div>
            <div className="text-sm text-gray-600">Launched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{statusStats['Backlog'] || 0}</div>
            <div className="text-sm text-gray-600">In Backlog</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={categoryColors[idea.category]}>
                        {idea.category}
                      </Badge>
                      <Select
                        value={idea.status}
                        onValueChange={(value) => updateIdeaStatus(idea.id, value)}
                      >
                        <SelectTrigger className="w-32 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status} className="text-xs">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(idea)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteIdea(idea.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {idea.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {idea.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {ideas.length === 0 ? 'No ideas captured yet' : 'No ideas match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {ideas.length === 0 
                ? 'Start capturing your creative ideas and turn them into reality.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {ideas.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Capture Your First Idea
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Pipeline */}
      {ideas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Idea Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statuses.map(status => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{statusStats[status] || 0}</div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspiration Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">💡 Idea Generation Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h4 className="font-medium mb-2">Capture Everything:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Write down ideas immediately</li>
                <li>• Don't judge ideas initially</li>
                <li>• Use voice memos when writing isn't possible</li>
                <li>• Review and refine later</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Develop Ideas:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Research market demand</li>
                <li>• Break down into actionable steps</li>
                <li>• Seek feedback from others</li>
                <li>• Start with small experiments</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 italic">
              "The way to get started is to quit talking and begin doing." - Walt Disney
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}