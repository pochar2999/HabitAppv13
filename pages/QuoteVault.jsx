
import React, { useState, useEffect } from 'react';
import { Quote } from '@/entities/Quote';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Added this import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categories = ["Motivation", "Wisdom", "Life", "Success", "Humor", "Philosophy", "Other"];

export default function QuoteVault() {
  const [quotes, setQuotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const quoteData = await Quote.filter({ user_id: userData.id });
        setQuotes(quoteData);
      } catch (error) {
        console.error("Error loading quotes:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentQuote({ category: 'Motivation' });
    setShowDialog(true);
  };

  const openEditDialog = (quote) => {
    setIsEditing(true);
    setCurrentQuote(quote);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!currentQuote || !currentQuote.content) return alert("Quote content cannot be empty.");

    try {
      if (isEditing) {
        await Quote.update(currentQuote.id, currentQuote);
      } else {
        await Quote.create({ ...currentQuote, user_id: user.id });
      }
      const quoteData = await Quote.filter({ user_id: user.id });
      setQuotes(quoteData);
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving quote:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    await Quote.delete(id);
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const filteredQuotes = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote Vault</h1>
            <p className="text-gray-600 mt-1">A personal collection of wisdom and inspiration.</p>
          </div>
        </div>
        <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Add Quote</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Quotes</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map(quote => (
              <Card key={quote.id} className="flex flex-col">
                <CardContent className="p-6 flex-grow">
                  <p className="text-lg italic text-gray-800">"{quote.content}"</p>
                  <p className="text-right mt-4 font-semibold text-gray-600">- {quote.author || 'Unknown'}</p>
                </CardContent>
                <div className="p-4 border-t flex justify-between items-center">
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{quote.category}</span>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(quote)}><Edit className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredQuotes.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">No quotes found. Add your first one!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Quote</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="content">Quote</Label><Textarea id="content" value={currentQuote?.content || ''} onChange={e => setCurrentQuote({...currentQuote, content: e.target.value})} /></div>
            <div><Label htmlFor="author">Author</Label><Input id="author" value={currentQuote?.author || ''} onChange={e => setCurrentQuote({...currentQuote, author: e.target.value})} /></div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={currentQuote?.category || ''} onValueChange={value => setCurrentQuote({...currentQuote, category: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
