import React, { useState, useEffect } from "react";
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
import { Plus, CheckSquare, Calendar, Edit, Trash2, Clock, AlertCircle } from "lucide-react";
import { format, isAfter, isBefore, isToday } from "date-fns";

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function TodoList() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: ''
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
      setTodos(todoData.sort((a, b) => {
        // Sort by completion status first, then by due date
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (a.due_date && b.due_date) {
          return new Date(a.due_date) - new Date(b.due_date);
        }
        return 0;
      }));
    } catch (error) {
      console.error("Error loading data:", error);
      // Don't block the UI on error
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) {
      alert("Please enter a todo title.");
      return;
    }

    try {
      const todoToSave = {
        ...newTodo,
        completed: false
      };

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
        category: ''
      });
      setEditingTodo(null);
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving todo:", error);
    }
  };

  const toggleTodo = async (todo) => {
    try {
      await Todo.update(currentUser.uid, todo.id, { 
        completed: !todo.completed,
        updated_date: new Date().toISOString()
      });
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

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date || '',
      priority: todo.priority || 'medium',
      category: todo.category || ''
    });
    setShowDialog(true);
  };

  const isOverdue = (todo) => {
    if (!todo.due_date || todo.completed) return false;
    return isBefore(new Date(todo.due_date), new Date()) && !isToday(new Date(todo.due_date));
  };

  const isDueToday = (todo) => {
    if (!todo.due_date || todo.completed) return false;
    return isToday(new Date(todo.due_date));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = todos.filter(t => !t.completed).length;
  const overdueTodos = todos.filter(t => isOverdue(t)).length;
  const dueTodayTodos = todos.filter(t => isDueToday(t)).length;

  const categories = [...new Set(todos.map(t => t.category).filter(Boolean))];

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
              category: ''
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
              <DialogTitle>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</DialogTitle>
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
                  placeholder="Additional details..."
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
                <Input
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  placeholder="e.g., Work, Personal, Shopping"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTodo}>
                  {editingTodo ? 'Update Todo' : 'Add Todo'}
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
            <CheckSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{todos.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{completedTodos}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{dueTodayTodos}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overdueTodos}</div>
            <div className="text-sm text-gray-600">Overdue</div>
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
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todo List */}
      {filteredTodos.length > 0 ? (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <Card 
              key={todo.id} 
              className={`transition-all ${
                todo.completed 
                  ? 'bg-green-50 border-green-200' 
                  : isOverdue(todo)
                  ? 'bg-red-50 border-red-200'
                  : isDueToday(todo)
                  ? 'bg-orange-50 border-orange-200'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={priorityColors[todo.priority] || priorityColors.medium}>
                        {todo.priority} priority
                      </Badge>
                      {todo.category && (
                        <Badge variant="outline">{todo.category}</Badge>
                      )}
                      {todo.due_date && (
                        <div className={`flex items-center gap-1 text-sm ${
                          isOverdue(todo) ? 'text-red-600 font-medium' :
                          isDueToday(todo) ? 'text-orange-600 font-medium' :
                          'text-gray-500'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {isToday(new Date(todo.due_date)) 
                            ? 'Due today'
                            : `Due ${format(new Date(todo.due_date), 'MMM d, yyyy')}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {todos.length === 0 ? 'No todos yet' : 'No todos match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {todos.length === 0 
                ? 'Add your first todo to get started with task management.'
                : 'Try adjusting your category or priority filters.'
              }
            </p>
            {todos.length === 0 && (
              <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Todo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}