
import React, { useState, useEffect } from 'react';
import { Goal } from '@/entities/Goal';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Star, Flag, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils'; // Moved createPageUrl to a centralized utility file

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const goalData = await Goal.filter({ user_id: userData.id });
        setGoals(goalData);
      } catch (error) {
        console.error("Error loading goals:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentGoal({ status: 'active', progress: 0, milestones: [] });
    setShowDialog(true);
  };
  
  const openEditDialog = (goal) => {
    setIsEditing(true);
    setCurrentGoal(goal);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (isEditing) {
      await Goal.update(currentGoal.id, currentGoal);
    } else {
      await Goal.create({ ...currentGoal, user_id: user.id });
    }
    const goalData = await Goal.filter({ user_id: user.id });
    setGoals(goalData);
    setShowDialog(false);
  };

  const handleDelete = async (id) => {
    await Goal.delete(id);
    setGoals(goals.filter(g => g.id !== id));
  };
  
  const handleMilestoneToggle = (goal, milestoneIndex) => {
    const updatedMilestones = goal.milestones.map((m, i) => i === milestoneIndex ? {...m, completed: !m.completed} : m);
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    // Ensure total milestones is not zero to prevent division by zero
    const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
    const updatedGoal = {...goal, milestones: updatedMilestones, progress };
    
    setCurrentGoal(updatedGoal);
  };

  const addMilestone = () => {
    const updatedGoal = {...currentGoal, milestones: [...currentGoal.milestones, {title: '', completed: false}] };
    setCurrentGoal(updatedGoal);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="text-gray-600 mt-1">Set, track, and conquer your long-term ambitions.</p>
          </div>
        </div>
        <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />New Goal</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{goal.title}</CardTitle>
                <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>{goal.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">{goal.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
              <div className="space-y-2">
                <Progress value={goal.progress} />
                <p className="text-xs text-right">{goal.progress}% complete</p>
                
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <h4 className="font-semibold">Milestones</h4>
                    {goal.milestones.map((m, i) => (
                      <div key={i} className={`text-sm flex items-center gap-2 ${m.completed ? 'text-gray-400 line-through' : ''}`}>
                        <Flag className="w-4 h-4"/> {m.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <div className="p-4 flex justify-between items-center text-sm text-gray-500">
                {goal.target_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{format(parseISO(goal.target_date), 'MMM yyyy')}</span>}
                <div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}><Edit className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                </div>
              </div>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'New'} Goal</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            <div><Label>Title</Label><Input value={currentGoal?.title || ''} onChange={(e) => setCurrentGoal({...currentGoal, title: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={currentGoal?.description || ''} onChange={(e) => setCurrentGoal({...currentGoal, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={currentGoal?.category || ''} onChange={(e) => setCurrentGoal({...currentGoal, category: e.target.value})} /></div>
              <div>
                <Label>Target Date</Label>
                <Input 
                  type="date" 
                  value={currentGoal?.target_date ? currentGoal.target_date.slice(0, 10) : ''} 
                  onChange={(e) => setCurrentGoal({...currentGoal, target_date: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <Label>Milestones</Label>
              <div className="space-y-2">
              {(currentGoal?.milestones || []).map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox checked={m.completed} onCheckedChange={() => handleMilestoneToggle(currentGoal, i)}/>
                  <Input 
                    value={m.title} 
                    onChange={(e) => {
                      const updatedMilestones = [...currentGoal.milestones];
                      updatedMilestones[i].title = e.target.value;
                      setCurrentGoal({...currentGoal, milestones: updatedMilestones});
                    }}
                    placeholder={`Milestone ${i+1}`}
                  />
                </div>
              ))}
              </div>
              <Button variant="outline" size="sm" onClick={addMilestone} className="mt-2"><Plus className="w-4 h-4 mr-2"/>Add Milestone</Button>
            </div>
            <div><Label>Status</Label>
              <Select value={currentGoal?.status} onValueChange={(v) => setCurrentGoal({...currentGoal, status: v, progress: v === 'completed' ? 100 : currentGoal.progress})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
