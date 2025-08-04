import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { VaultEntry } from "../entities/VaultEntry";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Lock, Eye, EyeOff, Copy, Edit, Trash2, Shield, AlertTriangle } from "lucide-react";

export default function PasswordVault() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({
    service_name: '',
    username: '',
    encrypted_password: '',
    notes: ''
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
      
      const entryData = await VaultEntry.filter({ user_id: userData.id });
      setEntries(entryData.sort((a, b) => a.service_name.localeCompare(b.service_name)));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createEntry = async () => {
    if (!newEntry.service_name.trim() || !newEntry.username.trim() || !newEntry.encrypted_password.trim()) {
      alert("Please fill in service name, username, and password.");
      return;
    }

    try {
      const entryToSave = {
        ...newEntry,
        user_id: user.id,
        // In a real app, you would encrypt the password here
        encrypted_password: btoa(newEntry.encrypted_password) // Simple base64 encoding for demo
      };

      if (editingEntry) {
        await VaultEntry.update(editingEntry.id, entryToSave);
      } else {
        await VaultEntry.create(entryToSave);
      }

      setNewEntry({
        service_name: '',
        username: '',
        encrypted_password: '',
        notes: ''
      });
      setEditingEntry(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const deleteEntry = async (id) => {
    if (confirm("Are you sure you want to delete this password entry?")) {
      try {
        await VaultEntry.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      service_name: entry.service_name,
      username: entry.username,
      encrypted_password: atob(entry.encrypted_password), // Decode for editing
      notes: entry.notes || ''
    });
    setShowDialog(true);
  };

  const togglePasswordVisibility = (entryId) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert(`${type} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewEntry(prev => ({ ...prev, encrypted_password: password }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'No password', color: 'text-gray-500' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: score, label: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { strength: score, label: 'Medium', color: 'text-yellow-500' };
    return { strength: score, label: 'Strong', color: 'text-green-500' };
  };

  const filteredEntries = entries.filter(entry =>
    entry.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Password Vault</h1>
          <p className="text-gray-600 mt-2">Securely store your passwords and credentials</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingEntry(null);
            setNewEntry({
              service_name: '',
              username: '',
              encrypted_password: '',
              notes: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Password' : 'Add New Password'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service_name">Service/Website</Label>
                <Input
                  id="service_name"
                  value={newEntry.service_name}
                  onChange={(e) => setNewEntry({ ...newEntry, service_name: e.target.value })}
                  placeholder="e.g., Gmail, Facebook, Bank"
                />
              </div>
              <div>
                <Label htmlFor="username">Username/Email</Label>
                <Input
                  id="username"
                  value={newEntry.username}
                  onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={newEntry.encrypted_password}
                    onChange={(e) => setNewEntry({ ...newEntry, encrypted_password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
                {newEntry.encrypted_password && (
                  <div className="mt-2">
                    <div className={`text-sm ${getPasswordStrength(newEntry.encrypted_password).color}`}>
                      Strength: {getPasswordStrength(newEntry.encrypted_password).label}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createEntry}>
                  {editingEntry ? 'Update Password' : 'Save Password'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Warning */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Security Notice</h3>
              <p className="text-sm text-yellow-800 mt-1">
                This is a demo password vault. In a real application, passwords would be encrypted with strong encryption 
                and additional security measures would be in place. Never store real passwords in demo applications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-sm text-gray-600">Stored Passwords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {entries.filter(e => getPasswordStrength(atob(e.encrypted_password)).label === 'Strong').length}
            </div>
            <div className="text-sm text-gray-600">Strong Passwords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {entries.filter(e => getPasswordStrength(atob(e.encrypted_password)).label === 'Weak').length}
            </div>
            <div className="text-sm text-gray-600">Weak Passwords</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Password Entries */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const isPasswordVisible = visiblePasswords.has(entry.id);
            const decryptedPassword = atob(entry.encrypted_password);
            const passwordStrength = getPasswordStrength(decryptedPassword);
            
            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{entry.service_name}</h3>
                          <p className="text-sm text-gray-600">{entry.username}</p>
                        </div>
                        <Badge className={`${passwordStrength.color} bg-opacity-10`}>
                          {passwordStrength.label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium w-20">Username:</Label>
                          <div className="flex items-center gap-2 flex-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                              {entry.username}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.username, 'Username')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium w-20">Password:</Label>
                          <div className="flex items-center gap-2 flex-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1 font-mono">
                              {isPasswordVisible ? decryptedPassword : '••••••••••••'}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(entry.id)}
                            >
                              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(decryptedPassword, 'Password')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="flex items-start gap-2">
                            <Label className="text-sm font-medium w-20">Notes:</Label>
                            <p className="text-sm text-gray-600 flex-1">{entry.notes}</p>
                          </div>
                        )}
                      </div>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {entries.length === 0 ? 'No passwords stored yet' : 'No passwords match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {entries.length === 0 
                ? 'Start building your secure password vault by adding your first password.'
                : 'Try adjusting your search terms.'
              }
            </p>
            {entries.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Password
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🔒 Password Security Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Strong Passwords:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Use at least 12 characters</li>
                <li>• Mix uppercase and lowercase</li>
                <li>• Include numbers and symbols</li>
                <li>• Avoid dictionary words</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Use unique passwords for each account</li>
                <li>• Enable two-factor authentication</li>
                <li>• Update passwords regularly</li>
                <li>• Never share passwords</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}