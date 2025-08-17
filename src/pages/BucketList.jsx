import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    target_date: "",
    photo_url: "",
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
        user_id: user.id,
      };

      if (editingItem) {
        await BucketListItem.update(editingItem.id, itemToSave);
      } else {
        await BucketListItem.create(itemToSave);
      }

      setNewItem({
        title: "",
        description: "",
        target_date: "",
        photo_url: "",
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
      description: item.description || "",
      target_date: item.target_date || "",
      photo_url: item.photo_url || "",
    });
    setShowDialog(true);
  };

  const completedItems = items.filter((item) => item.completed);
  const pendingItems = items.filter((item) => !item.completed);
  const completionRate = items.length > 0 ? (completedItems.length / items.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingItem(null);
              setNewItem({
                title: "",
                description: "",
                target_date: "",
                photo_url: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Dream
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Dream" : "Add New Dream"}</DialogTitle>
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={createItem}>
                  {editingItem ? "Update Dream" : "Add Dream"}
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
            <List className="w-8 h-8 text-primary mx-auto mb-2" />
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
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{pendingItems.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your bucket list is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start adding your dreams, goals, and experiences you want to achieve in your lifetime.
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Dream
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
