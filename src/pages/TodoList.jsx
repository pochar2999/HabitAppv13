import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Plus, Calendar, CheckCircle, Clock, Trash2, Edit, ArrowLeft, AlertTriangle, ArrowUpDown } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

const categories = [
  'Health & Fitness',
  'Work / School', 
  'Personal Growth',
  'Household',
  'Errands',
  'Finance',
  'Social / Relationships',
  'Hobbies / Fun',
  'Goals / Challenges',
  'Mindfulness / Wellness',
  'Other'
];

export default function TodoList() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: 'Personal Growth'
  });
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
      
      const todoData = await Todo.filter(currentUser.uid);
      
      // Auto-remove completed tasks older than 24 hours
      const now = new Date();
      const filteredTodos = todoData.filter(todo => {
        if (todo.completed && todo.completed_at) {
          const completedTime = new Date(todo.completed_at);
          const hoursSinceCompleted = (now - completedTime) / (1000 * 60 * 60);
          return hoursSinceCompleted < 24;
        }
        return true;
      });
      
      setTodos(filteredTodos.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)));
    } catch (error) {
      console.error("Error loading data:", error);
      // Don't block the UI on error
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) {
      alert("Please enter a title for your todo.");
      return;
    }

    try {
      const todoToSave = editingTodo ? newTodo : newTodo;
      
      if (editingTodo) {
        await Todo.update(currentUser.uid, editingTodo.id, todoToSave);
      } else {
        await Todo.create(currentUser.uid, todoToSave);
      }
      
      setNewTodo({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'Personal Growth'
      });
      setEditingTodo(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      await Todo.update(currentUser.uid, id, updates);
      loadData();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    if (confirm("Are you sure you want to delete this todo?")) {
      try {
        await Todo.delete(currentUser.uid, id);
        loadData();
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  const toggleComplete = (todo) => {
    const updates = { 
      completed: !todo.completed,
      completed_at: !todo.completed ? new Date().toISOString() : null
    };
    updateTodo(todo.id, updates);
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date || '',
      priority: todo.priority || 'medium',
      category: todo.category || 'Personal Growth'
    });
    setShowDialog(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return isPast(parseISO(dueDate)) && format(parseISO(dueDate), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);
  const overdueTodos = todos.filter(todo => !todo.completed && isOverdue(todo.due_date));

  // Apply filters and sorting
  const getFilteredAndSortedTodos = () => {
    let filtered = todos;
    
    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(todo => 
        filterStatus === 'completed' ? todo.completed : !todo.completed
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === filterCategory);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
          bValue = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        default: // created
          aValue = new Date(a.created_date || 0);
          bValue = new Date(b.created_date || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredTodos = getFilteredAndSortedTodos();

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
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Features
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
            <p className="text-gray-600 mt-2">Organize your tasks and stay productive</p>
            <p className="text-sm text-orange-600 mt-1">Completed tasks disappear after 24 hours</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingTodo(null);
            setNewTodo({
              title: '',
              description: '',
              due_date: '',
              priority: 'medium',
              category: 'Personal Growth'
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTodo.category} onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}>
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
                <Button onClick={createTodo}>
                  {editingTodo ? 'Update Todo' : 'Create Todo'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 Why Use a To-Do List?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Writing tasks down ensures you don't forget them. A to-do list helps clear your mind, reduces mental clutter, 
            and gives you a visual sense of control. It keeps you organized, reduces stress, and helps you focus on what 
            actually needs to get done — instead of just reacting to the day.
          </p>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Using Your To-Do List:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>– Start simple: Focus on 3–5 key tasks</li>
              <li>– Add due dates or priorities to plan better</li>
              <li>– Check it morning and night to stay on track</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingTodos.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{overdueTodos.length}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Complete</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Order</Label>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full justify-center"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {filteredTodos.length > 0 ? (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <Card
              key={todo.id}
              className={`transition-all ${
                todo.completed 
                  ? 'bg-green-50 border-green-200' 
                  : isOverdue(todo.due_date) 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleComplete(todo)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Badge>
                          {todo.category && (
                            <Badge variant="outline">{todo.category}</Badge>
                          )}
                          {todo.due_date && (
                            <div className={`flex items-center gap-1 text-xs ${
                              isOverdue(todo.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(todo.due_date), 'MMM d, yyyy')}
                              {isOverdue(todo.due_date) && ' (Overdue)'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(todo)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : todos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No todos yet</h3>
            <p className="text-gray-600 mb-6">Create your first todo to get started with organizing your tasks.</p>
            <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Todo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks match your filters</h3>
            <p className="text-gray-600">Try adjusting your filter settings to see more tasks.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
          <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          <p className="text-gray-600 mt-2">Organize your tasks and stay productive</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingTodo(null);
            setNewTodo({
              title: '',
              description: '',
              due_date: '',
              priority: 'medium',
              category: 'Personal Growth'
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTodo.category} onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}>
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
                <Button onClick={createTodo}>
                  {editingTodo ? 'Update Todo' : 'Create Todo'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}