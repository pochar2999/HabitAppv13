import React, { useState, useEffect } from 'react';
import { FutureLetter } from '@/entities/FutureLetter';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Lock, Unlock, Mail, ArrowLeft, Send } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from 'framer-motion';

export default function FutureSelf() {
  const [letters, setLetters] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newLetter, setNewLetter] = useState({ title: '', content: '', unlock_date: '' });
  const [viewingLetter, setViewingLetter] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const letterData = await FutureLetter.filter({ user_id: userData.id });
        setLetters(letterData.sort((a,b) => new Date(b.unlock_date) - new Date(a.unlock_date)));
      } catch (error) {
        console.error("Error loading letters:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!newLetter.title || !newLetter.content || !newLetter.unlock_date) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await FutureLetter.create({ ...newLetter, user_id: user.id });
      const letterData = await FutureLetter.filter({ user_id: user.id });
      setLetters(letterData.sort((a,b) => new Date(b.unlock_date) - new Date(a.unlock_date)));
      setShowDialog(false);
      setNewLetter({ title: '', content: '', unlock_date: '' });
    } catch (error) {
      console.error("Error saving letter:", error);
      alert("Failed to save letter. Please try again.");
    }
  };
  
  if (loading) return <div>Loading...</div>;

  const lockedLetters = letters.filter(l => !isPast(parseISO(l.unlock_date)));
  const unlockedLetters = letters.filter(l => isPast(parseISO(l.unlock_date)));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Letter to My Future Self</h1>
            <p className="text-gray-600 mt-1">Send wisdom through time. What will you tell yourself?</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setNewLetter({ title: '', content: '', unlock_date: '' })}><Plus className="w-4 h-4 mr-2" />Write New Letter</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>A Message to the Future</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label htmlFor="title">Title</Label><Input id="title" value={newLetter.title} onChange={e => setNewLetter({...newLetter, title: e.target.value})} placeholder="e.g., On turning 30" /></div>
              <div><Label htmlFor="content">Your Letter</Label><Textarea id="content" value={newLetter.content} onChange={e => setNewLetter({...newLetter, content: e.target.value})} rows={10} placeholder="Dear Future Me..."/></div>
              <div><Label htmlFor="unlock-date">Unlock Date</Label><Input id="unlock-date" type="date" value={newLetter.unlock_date} onChange={e => setNewLetter({...newLetter, unlock_date: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4 mr-2"/>Seal Letter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Lock className="text-gray-500"/>Time-Locked Letters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lockedLetters.length === 0 ? (
            <p className="text-gray-500 col-span-full">No locked letters yet. Your future self is waiting!</p>
          ) : (
            lockedLetters.map(l => (
              <motion.div key={l.id} whileHover={{ y: -5 }} className="relative">
                <Card className="bg-gray-800 text-white border-gray-700 shadow-lg h-full flex flex-col justify-center items-center p-6 text-center">
                  <Mail className="w-16 h-16 text-gray-500 mb-4"/>
                  <CardTitle className="truncate font-semibold">{l.title}</CardTitle>
                  <p className="mt-2 text-gray-400">Unlocks on {format(parseISO(l.unlock_date), 'MMMM d, yyyy')}</p>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Unlock className="text-green-500"/>Unlocked Letters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedLetters.length === 0 ? (
            <p className="text-gray-500 col-span-full">No unlocked letters yet. Patience is a virtue.</p>
          ) : (
            unlockedLetters.map(l => (
              <motion.div key={l.id} whileHover={{ y: -5 }} className="cursor-pointer" onClick={() => setViewingLetter(l)}>
                <Card className="bg-white hover:shadow-xl transition-shadow border h-full flex flex-col justify-center items-center p-6 text-center">
                  <Mail className="w-16 h-16 text-blue-500 mb-4"/>
                  <CardTitle className="truncate font-semibold text-gray-800">{l.title}</CardTitle>
                  <p className="mt-2 text-gray-500">Unlocked on {format(parseISO(l.unlock_date), 'MMMM d, yyyy')}</p>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!viewingLetter} onOpenChange={() => setViewingLetter(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingLetter?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <p className="whitespace-pre-wrap text-gray-700">{viewingLetter?.content}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setViewingLetter(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
