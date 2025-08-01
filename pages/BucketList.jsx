import React, { useState, useEffect } from 'react';
import { BucketListItem } from '@/entities/BucketListItem';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, CheckCircle, ImagePlus, ArrowLeft, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const placeholderImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
  "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max",
];

export default function BucketList() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const itemData = await BucketListItem.filter({ user_id: userData.id });
        setItems(itemData);
      } catch (error) {
        console.error("Error loading bucket list:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentItem({});
    setShowDialog(true);
  };
  
  const openEditDialog = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!currentItem || !currentItem.title) {
        alert("Title cannot be empty.");
        return;
    }
    
    let itemToSave = { ...currentItem };
    if (itemToSave.target_date) {
        try {
            const date = new Date(itemToSave.target_date);
            if (!isNaN(date.getTime())) {
                itemToSave.target_date = format(date, 'yyyy-MM-dd');
            } else {
                itemToSave.target_date = null;
            }
        } catch (e) {
            itemToSave.target_date = null;
        }
    }

    try {
        if (isEditing) {
            await BucketListItem.update(itemToSave.id, itemToSave);
        } else {
            await BucketListItem.create({ ...itemToSave, user_id: user.id });
        }
        const itemData = await BucketListItem.filter({ user_id: user.id });
        setItems(itemData);
        setShowDialog(false);
    } catch (error) {
        console.error("Error saving bucket list item:", error);
        alert("Failed to save item. Please try again.");
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await BucketListItem.delete(id);
    setItems(items.filter(item => item.id !== id));
  };
  
  const toggleComplete = async (item) => {
    await BucketListItem.update(item.id, { completed: !item.completed });
    setItems(items.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading Bucket List...</div>;

  const completedItems = items.filter(i => i.completed);
  const incompleteItems = items.filter(i => !i.completed);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bucket List</h1>
            <p className="text-gray-600 mt-1">Dream. Plan. Achieve. Your life's adventures await.</p>
          </div>
        </div>
        <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Add Adventure</Button>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Adventures to Conquer ({incompleteItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {incompleteItems.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  Your adventure book is empty! Add a new goal to get started.
                </motion.div>
              )}
              {incompleteItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"}}
                  className="rounded-lg overflow-hidden bg-white border"
                >
                  <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url(${item.photo_url || placeholderImages[index % placeholderImages.length]})`}}></div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleComplete(item)} className="mt-1 flex-shrink-0 w-6 h-6 border-2 border-gray-400 rounded-full hover:bg-green-100 transition"></button>
                      <CardTitle className="text-lg font-semibold leading-tight flex-1">{item.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-9 line-clamp-2">{item.description || "No description."}</p>
                  </CardContent>
                  <div className="p-4 flex justify-between items-center text-sm text-gray-500 border-t">
                    {item.target_date ? (
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{format(parseISO(item.target_date), 'MMM d, yyyy')}</span>
                    ) : <span></span>}
                    <div>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Edit className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Completed Adventures ({completedItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {completedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg overflow-hidden border relative"
                >
                  <div className="h-48 bg-cover bg-center relative" style={{backgroundImage: `url(${item.photo_url || placeholderImages[index % placeholderImages.length]})`}}>
                    <div className="absolute inset-0 bg-black/50"></div>
                  </div>
                  <CardContent className="p-4 absolute inset-0 flex flex-col justify-end text-white">
                     <div className="flex items-start gap-3">
                      <button onClick={() => toggleComplete(item)} className="mt-1 flex-shrink-0 w-6 h-6 border-2 bg-green-500 border-green-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white"/>
                      </button>
                      <CardTitle className="text-lg font-bold leading-tight flex-1 line-through">{item.title}</CardTitle>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Adventure</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" value={currentItem?.title || ''} onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})} /></div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" value={currentItem?.description || ''} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} /></div>
            <div><Label htmlFor="target_date">Target Date</Label><Input id="target_date" type="date" value={currentItem?.target_date ? format(parseISO(currentItem.target_date), 'yyyy-MM-dd') : ''} onChange={(e) => setCurrentItem({...currentItem, target_date: e.target.value})} /></div>
            <div><Label htmlFor="photo_url">Photo URL</Label><Input id="photo_url" value={currentItem?.photo_url || ''} onChange={(e) => setCurrentItem({...currentItem, photo_url: e.target.value})} placeholder="https://images.unsplash.com/..."/></div>
          </div>
          <div className="flex justify-end gap-2 p-4 pt-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
