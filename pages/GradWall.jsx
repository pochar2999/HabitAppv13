
import React, { useState, useEffect } from 'react';
import { GratitudeEntry } from '@/entities/GratitudeEntry';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, ArrowLeft, X } from 'lucide-react'; // Added X here
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const stickyNoteColors = {
  yellow: 'bg-yellow-200 border-yellow-300 text-yellow-900',
  pink: 'bg-pink-200 border-pink-300 text-pink-900',
  blue: 'bg-blue-200 border-blue-300 text-blue-900',
  green: 'bg-green-200 border-green-300 text-green-900',
  purple: 'bg-purple-200 border-purple-300 text-purple-900',
  orange: 'bg-orange-200 border-orange-300 text-orange-900'
};

export default function GratitudeWall() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: '',
    color: 'yellow'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const entriesData = await GratitudeEntry.filter({ user_id: userData.id });
      setEntries(entriesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error loading gratitude entries:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      await GratitudeEntry.create({
        ...newEntry,
        user_id: user.id,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setNewEntry({ content: '', color: 'yellow' });
      setShowDialog(false);
      loadData(); // Reload data after submission
    } catch (error) {
      console.error("Error creating gratitude entry:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this gratitude entry?")) {
      try {
        await GratitudeEntry.delete(id);
        loadData(); // Use loadData consistent with existing function name
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const getRandomRotation = () => {
    return Math.random() * 6 - 3; // Random rotation between -3 and 3 degrees
  };

  const getRandomOffset = () => {
    return {
      x: Math.random() * 20 - 10, // Random x offset between -10 and 10px
      y: Math.random() * 20 - 10  // Random y offset between -10 and 10px
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gratitude Wall</h1>
            <p className="text-gray-600 mt-1">Share what you're grateful for and spread positivity</p>
          </div>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
              <Heart className="w-4 h-4 mr-2" />
              Add Gratitude
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What are you grateful for today?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="I'm grateful for..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                rows={4}
                className="resize-none"
              />
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Choose a sticky note color:
                </label>
                <div className="flex gap-2">
                  {Object.keys(stickyNoteColors).map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border-2 ${stickyNoteColors[color]} ${
                        newEntry.color === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                      onClick={() => setNewEntry({...newEntry, color})}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!newEntry.content.trim()}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  Add to Wall
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wall Background */}
      <div className="min-h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-300 rounded-full"></div>
          <div className="absolute bottom-40 right-40 w-24 h-24 bg-green-300 rounded-full"></div>
        </div>

        {/* Gratitude Notes */}
        <div className="relative">
          {entries.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Your gratitude wall is waiting
              </h3>
              <p className="text-gray-500 mb-6">
                Start by adding something you're grateful for today
              </p>
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Gratitude
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <AnimatePresence>
                {entries.map((entry, index) => {
                  const offset = getRandomOffset();
                  const rotation = getRandomRotation();
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        rotate: rotation,
                        x: offset.x,
                        y: offset.y
                      }}
                      exit={{ opacity: 0, scale: 0.8, y: -50 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotate: 0,
                        x: 0,
                        y: 0,
                        zIndex: 10
                      }}
                      className="cursor-pointer"
                    >
                      <Card className={`
                        ${stickyNoteColors[entry.color]}
                        border-2 border-dashed
                        shadow-lg hover:shadow-xl
                        transition-all duration-300
                        min-h-[200px]
                        relative
                      `}>
                        {/* Tape effect */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-200 border border-gray-300 rounded-sm opacity-60"></div>
                        
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card's whileHover from interfering
                            handleDelete(entry.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 p-0 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        
                        <CardContent className="p-4 h-full flex flex-col justify-between">
                          <p className="text-sm leading-relaxed font-medium pr-6"> {/* Added pr-6 for delete button space */}
                            {entry.content}
                          </p>
                          <div className="text-xs opacity-75 mt-4 text-right">
                            {format(parseISO(entry.date), 'MMM d')}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {entries.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Gratitude Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {entries.filter(e => {
                    const entryDate = parseISO(e.date);
                    const now = new Date();
                    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.ceil(entries.length / 7)}
                </div>
                <div className="text-sm text-gray-600">Weeks of Gratitude</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
