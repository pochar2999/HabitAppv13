import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { BucketListItem } from "../entities/BucketListItem";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Plus, List, Calendar, CheckCircle, Star, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

export default function BucketList() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    target_date: '',
    photo_url: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const itemData = await BucketListItem.filter({ user_id: userData.id });
      setItems(itemData.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createItem = async () => {
    if (!newItem.title.trim()) {
      alert("Please enter a title for your bucket list item.");
      return;
    }

    try {
      const itemToSave = {
        ...newItem,
        user_id: user.id
      };

      if (editingItem) {
        await BucketListItem.update(editingItem.id, itemToSave);
      } else {
        await BucketListItem.create(itemToSave);
      }

      setNewItem({
        title: '',
        description: '',
        target_date: '',
        photo_url: ''
      });
      setEditingItem(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const toggleComplete = async (item) => {
    try {
      await BucketListItem.update(item.id, { completed: !item.completed });
      loadData();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this bucket list item?")) {
      try {
        await BucketListItem.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description || '',
      target_date: item.target_date || '',
      photo_url: item.photo_url || ''
    });
    setShowDialog(true);
  };

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);
  const completionRate = items.length > 0 ? (completedItems.length / items.length) * 100 : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Bucket List</h1>
          <p className="text-gray-600 mt-2">Track your life goals and dreams</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingItem(null);
            setNewItem({
              title: '',
              description: '',
              target_date: '',
              photo_url: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Dream
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Dream' : 'Add New Dream'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">What's your dream?</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Visit the Northern Lights"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Why is this important to you?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="target_date">Target Date (optional)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={newItem.target_date}
                  onChange={(e) => setNewItem({ ...newItem, target_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL (optional)</Label>
                <Input
                  id="photo_url"
                  value={newItem.photo_url}
                  onChange={(e) => setNewItem({ ...newItem, photo_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createItem}>
                  {editingItem ? 'Update Dream' : 'Add Dream'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <List className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-600">Total Dreams</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedItems.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{pendingItems.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket List Items */}
      {items.length > 0 ? (
        <div className="space-y-6">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                Dreams to Achieve ({pendingItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {item.photo_url && (
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={item.photo_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => toggleComplete(item)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                              {item.target_date && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  Target: {format(new Date(item.target_date), 'MMM d, yyyy')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Dreams Achieved ({completedItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedItems.map((item) => (
                  <Card key={item.id} className="bg-green-50 border-green-200">
                    <CardContent className="p-0">
                      {item.photo_url && (
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={item.photo_url}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-75"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => toggleComplete(item)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-700 line-through">{item.title}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1 line-through">{item.description}</p>
                              )}
                              <Badge className="bg-green-100 text-green-800 mt-2">
                                ✨ Achieved!
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your bucket list is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start adding your dreams, goals, and experiences you want to achieve in your lifetime.
            </p>
            <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Dream
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inspiration Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-purple-900 mb-3">✨ Bucket List Inspiration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h4 className="font-medium mb-2">🌍 Travel & Adventure</h4>
              <ul className="space-y-1 text-xs">
                <li>• See the Northern Lights</li>
                <li>• Visit all 7 continents</li>
                <li>• Go on a safari</li>
                <li>• Hike a famous trail</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Personal Growth</h4>
              <ul className="space-y-1 text-xs">
                <li>• Learn a new language</li>
                <li>• Write a book</li>
                <li>• Run a marathon</li>
                <li>• Master a skill</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">❤️ Relationships</h4>
              <ul className="space-y-1 text-xs">
                <li>• Reconnect with old friends</li>
                <li>• Volunteer for a cause</li>
                <li>• Mentor someone</li>
                <li>• Host a big celebration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎨 Experiences</h4>
              <ul className="space-y-1 text-xs">
                <li>• Learn to cook a cuisine</li>
                <li>• Attend a music festival</li>
                <li>• Take an art class</li>
                <li>• Go skydiving</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}