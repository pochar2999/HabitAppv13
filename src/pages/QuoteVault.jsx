import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { Quote } from "../entities/Quote";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, MessageSquare, Search, Edit, Trash2, Quote as QuoteIcon, Shuffle } from "lucide-react";

const categoryColors = {
  Motivation: 'bg-blue-100 text-blue-800 border-blue-200',
  Wisdom: 'bg-purple-100 text-purple-800 border-purple-200',
  Life: 'bg-green-100 text-green-800 border-green-200',
  Success: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Humor: 'bg-pink-100 text-pink-800 border-pink-200',
  Philosophy: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function QuoteVault() {
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [randomQuote, setRandomQuote] = useState(null);
  const [newQuote, setNewQuote] = useState({
    content: '',
    author: '',
    category: 'Motivation'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const quoteData = await Quote.filter({ user_id: userData.id });
      setQuotes(quoteData);
      
      // Set a random quote if we have quotes
      if (quoteData.length > 0) {
        const randomIndex = Math.floor(Math.random() * quoteData.length);
        setRandomQuote(quoteData[randomIndex]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createQuote = async () => {
    if (!newQuote.content.trim() || !newQuote.author.trim()) {
      alert("Please fill in both quote content and author.");
      return;
    }

    try {
      const quoteToSave = {
        ...newQuote,
        user_id: user.id
      };

      if (editingQuote) {
        await Quote.update(editingQuote.id, quoteToSave);
      } else {
        await Quote.create(quoteToSave);
      }

      setNewQuote({
        content: '',
        author: '',
        category: 'Motivation'
      });
      setEditingQuote(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving quote:", error);
    }
  };

  const deleteQuote = async (id) => {
    if (confirm("Are you sure you want to delete this quote?")) {
      try {
        await Quote.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting quote:", error);
      }
    }
  };

  const startEdit = (quote) => {
    setEditingQuote(quote);
    setNewQuote({
      content: quote.content,
      author: quote.author,
      category: quote.category
    });
    setShowDialog(true);
  };

  const getRandomQuote = () => {
    if (quotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomIndex]);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quote.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(categoryColors);
  const categoryStats = categories.reduce((stats, category) => {
    stats[category] = quotes.filter(q => q.category === category).length;
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
          <h1 className="text-3xl font-bold text-gray-900">Quote Vault</h1>
          <p className="text-gray-600 mt-2">Save and organize inspiring quotes</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingQuote(null);
            setNewQuote({
              content: '',
              author: '',
              category: 'Motivation'
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingQuote ? 'Edit Quote' : 'Add New Quote'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Quote</Label>
                <Textarea
                  id="content"
                  value={newQuote.content}
                  onChange={(e) => setNewQuote({ ...newQuote, content: e.target.value })}
                  placeholder="Enter the quote..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newQuote.author}
                  onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                  placeholder="Who said this?"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newQuote.category} onValueChange={(value) => setNewQuote({ ...newQuote, category: value })}>
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
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createQuote}>
                  {editingQuote ? 'Update Quote' : 'Save Quote'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Random Quote of the Day */}
      {randomQuote && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <QuoteIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <blockquote className="text-xl font-medium text-gray-900 mb-4 italic">
              "{randomQuote.content}"
            </blockquote>
            <p className="text-gray-600 mb-4">— {randomQuote.author}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge className={categoryColors[randomQuote.category]}>
                {randomQuote.category}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={getRandomQuote}
                className="ml-2"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                New Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{quotes.length}</div>
            <div className="text-sm text-gray-600">Total Quotes</div>
          </CardContent>
        </Card>
        {Object.entries(categoryStats).slice(0, 3).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{category}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search quotes or authors..."
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
      </div>

      {/* Quotes List */}
      {filteredQuotes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <blockquote className="text-lg text-gray-900 mb-3 italic leading-relaxed">
                      "{quote.content}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-600 font-medium">— {quote.author}</p>
                      <Badge className={categoryColors[quote.category]}>
                        {quote.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(quote)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuote(quote.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {quotes.length === 0 ? 'No quotes saved yet' : 'No quotes match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {quotes.length === 0 
                ? 'Start building your collection of inspiring quotes.'
                : 'Try adjusting your search terms or category filter.'
              }
            </p>
            {quotes.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Quote
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map(category => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{categoryStats[category]}</div>
                  <div className="text-sm text-gray-600">{category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspiration Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-indigo-900 mb-3">💭 Why Collect Quotes?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div>
              <h4 className="font-medium mb-2">Personal Growth:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Gain new perspectives</li>
                <li>• Find motivation during tough times</li>
                <li>• Learn from great minds</li>
                <li>• Develop wisdom and insight</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Daily Inspiration:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Start your day with positivity</li>
                <li>• Share wisdom with others</li>
                <li>• Reflect on meaningful thoughts</li>
                <li>• Build a personal philosophy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}