import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { Goal } from "../entities/Goal";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, Target, Calendar, CheckCircle, Edit, Trash2, Star } from "lucide-react";
import { format } from "date-fns";

const categoryColors = {
  health: 'bg-green-100 text-green-800 border-green-200',
  career: 'bg-blue-100 text-blue-800 border-blue-200',
  finance: 'bg-purple-100 text-purple-800 border-purple-200',
  relationships: 'bg-pink-100 text-pink-800 border-pink-200',
  personal: 'bg-purple-100 text-purple-800 border-purple-200',
  education: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-gray-100 text-gray-800'
};

export default function Goals() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    progress: 0,
    status: 'active',
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Load data without blocking the UI
      setLoading(false);
      loadData().catch(console.error);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      setUser(userData);
      
      const goalData = await Goal.filter(currentUser.uid);
      setGoals(goalData.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)));
    } catch (error) {
      console.error("Error loading data:", error);
      // Don't block the UI on error
    }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) {
      alert("Please enter a goal title.");
      return;
    }

    try {
      const goalToSave = {
        ...newGoal,
        milestones: newGoal.milestones.map(m => ({
          title: m.title,
          completed: m.completed || false,
          date: m.date || null
        }))
      };

      if (editingGoal) {
        await Goal.update(currentUser.uid, editingGoal.id, goalToSave);
      } else {
        await Goal.create(currentUser.uid, goalToSave);
      }

      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        target_date: '',
        progress: 0,
        status: 'active',
        milestones: []
      });
      setEditingGoal(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const deleteGoal = async (id) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await Goal.delete(currentUser.uid, id);
        loadData();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const startEdit = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      target_date: goal.target_date || '',
      progress: goal.progress || 0,
      status: goal.status || 'active',
      milestones: goal.milestones || []
    });
    setShowDialog(true);
  };

  const updateGoalProgress = async (goalId, newProgress) => {
    try {
      const status = newProgress >= 100 ? 'completed' : 'active';
      await Goal.update(currentUser.uid, goalId, { progress: newProgress, status });
      loadData();
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };

  const toggleMilestone = async (goalId, milestoneIndex) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = [...(goal.milestones || [])];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed: !updatedMilestones[milestoneIndex].completed,
      date: !updatedMilestones[milestoneIndex].completed ? format(new Date(), 'yyyy-MM-dd') : null
    };

    try {
      await Goal.update(currentUser.uid, goalId, { milestones: updatedMilestones });
      loadData();
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setNewGoal(prev => ({
        ...prev,
        milestones: [...prev.milestones, { title: newMilestone.trim(), completed: false }]
      }));
      setNewMilestone('');
    }
  };

  const removeMilestone = (index) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const filteredGoals = goals.filter(goal => {
    const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const averageProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length 
    : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-2">Set and track your personal objectives</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingGoal(null);
            setNewGoal({
              title: '',
              description: '',
              category: 'personal',
              target_date: '',
              progress: 0,
              status: 'active',
              milestones: []
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal in detail..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="relationships">Relationships</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={newGoal.progress}
                    onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newGoal.status} onValueChange={(value) => setNewGoal({ ...newGoal, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Milestones</Label>
                <div className="space-y-2">
                  {newGoal.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1">{milestone.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a milestone..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                    />
                    <Button type="button" onClick={addMilestone} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createGoal}>
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
            <div className="text-sm text-gray-600">Total Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedGoals}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{averageProgress.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Average Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="relationships">Relationships</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className={`transition-all ${goal.status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg ${goal.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {goal.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={categoryColors[goal.category] || categoryColors.personal}>
                        {goal.category}
                      </Badge>
                      <Badge className={statusColors[goal.status] || statusColors.active}>
                        {goal.status}
                      </Badge>
                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(goal.target_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                )}
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>

                  {goal.milestones && goal.milestones.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Milestones</h5>
                      <div className="space-y-2">
                        {goal.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox
                              checked={milestone.completed}
                              onCheckedChange={() => toggleMilestone(goal.id, index)}
                              className="w-4 h-4"
                            />
                            <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                              {milestone.title}
                            </span>
                            {milestone.completed && milestone.date && (
                              <span className="text-xs text-gray-400">
                                ({format(new Date(milestone.date), 'MMM d')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.progress || 0}
                      onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-sm text-gray-500">% complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {goals.length === 0 
                ? 'Set your first goal to start tracking your progress.'
                : 'Try adjusting your category or status filters.'
              }
            </p>
            {goals.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}