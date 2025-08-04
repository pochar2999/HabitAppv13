import React, { useState, useEffect } from "react";
import { User } from "../entities/User";
import { MealEntry } from "../entities/MealEntry";
import { WaterEntry } from "../entities/WaterEntry";
import { NutritionGoals } from "../entities/NutritionGoals";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Plus, Apple, Droplets, Target, TrendingUp, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function FoodTracker() {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [waterEntries, setWaterEntries] = useState([]);
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [showWaterDialog, setShowWaterDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [newMeal, setNewMeal] = useState({
    meal_type: 'breakfast',
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    notes: ''
  });
  const [newWater, setNewWater] = useState({
    amount: '',
    unit: 'oz'
  });
  const [goals, setGoals] = useState({
    daily_calories: 2000,
    daily_protein: 50,
    daily_carbs: 250,
    daily_fat: 65,
    daily_water: 64,
    water_unit: 'oz'
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
      
      const mealData = await MealEntry.filter({ user_id: userData.id });
      const todayMeals = mealData.filter(meal => 
        meal.date === format(new Date(), 'yyyy-MM-dd')
      );
      setMeals(todayMeals);
      
      const waterData = await WaterEntry.filter({ user_id: userData.id });
      const todayWater = waterData.filter(entry => 
        entry.date === format(new Date(), 'yyyy-MM-dd')
      );
      setWaterEntries(todayWater);
      
      const goalsData = await NutritionGoals.filter({ user_id: userData.id });
      if (goalsData.length > 0) {
        setNutritionGoals(goalsData[0]);
        setGoals(goalsData[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const createMeal = async () => {
    if (!newMeal.food_name.trim()) {
      alert("Please enter a food name.");
      return;
    }

    try {
      await MealEntry.create({
        ...newMeal,
        user_id: user.id,
        calories: parseFloat(newMeal.calories) || 0,
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fat: parseFloat(newMeal.fat) || 0,
        fiber: parseFloat(newMeal.fiber) || 0,
        sugar: parseFloat(newMeal.sugar) || 0
      });
      
      setNewMeal({
        meal_type: 'breakfast',
        food_name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        notes: ''
      });
      setShowMealDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating meal:", error);
    }
  };

  const addWater = async () => {
    if (!newWater.amount) {
      alert("Please enter water amount.");
      return;
    }

    try {
      await WaterEntry.create({
        ...newWater,
        user_id: user.id,
        amount: parseFloat(newWater.amount)
      });
      
      setNewWater({
        amount: '',
        unit: 'oz'
      });
      setShowWaterDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const saveGoals = async () => {
    try {
      const goalsData = {
        ...goals,
        user_id: user.id
      };

      if (nutritionGoals) {
        await NutritionGoals.update(nutritionGoals.id, goalsData);
      } else {
        await NutritionGoals.create(goalsData);
      }
      
      setShowGoalsDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  };

  const deleteMeal = async (id) => {
    if (confirm("Are you sure you want to delete this meal entry?")) {
      try {
        await MealEntry.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting meal:", error);
      }
    }
  };

  const deleteWaterEntry = async (id) => {
    try {
      await WaterEntry.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting water entry:", error);
    }
  };

  // Calculate daily totals
  const dailyTotals = meals.reduce((totals, meal) => ({
    calories: totals.calories + (meal.calories || 0),
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fat: totals.fat + (meal.fat || 0),
    fiber: totals.fiber + (meal.fiber || 0),
    sugar: totals.sugar + (meal.sugar || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });

  const totalWater = waterEntries.reduce((total, entry) => total + (entry.amount || 0), 0);

  const currentGoals = nutritionGoals || goals;

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      lunch: 'bg-green-100 text-green-800 border-green-200',
      dinner: 'bg-blue-100 text-blue-800 border-blue-200',
      snack: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type] || colors.snack;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Food Tracker</h1>
          <p className="text-gray-600 mt-2">Monitor your nutrition and hydration</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Goals
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nutrition Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Daily Calories</Label>
                    <Input
                      type="number"
                      value={goals.daily_calories}
                      onChange={(e) => setGoals({...goals, daily_calories: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Daily Water ({goals.water_unit})</Label>
                    <Input
                      type="number"
                      value={goals.daily_water}
                      onChange={(e) => setGoals({...goals, daily_water: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Daily Protein (g)</Label>
                    <Input
                      type="number"
                      value={goals.daily_protein}
                      onChange={(e) => setGoals({...goals, daily_protein: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Daily Carbs (g)</Label>
                    <Input
                      type="number"
                      value={goals.daily_carbs}
                      onChange={(e) => setGoals({...goals, daily_carbs: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Daily Fat (g)</Label>
                    <Input
                      type="number"
                      value={goals.daily_fat}
                      onChange={(e) => setGoals({...goals, daily_fat: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Water Unit</Label>
                    <Select value={goals.water_unit} onValueChange={(value) => setGoals({...goals, water_unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveGoals}>
                    Save Goals
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showWaterDialog} onOpenChange={setShowWaterDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Droplets className="w-4 h-4 mr-2" />
                Add Water
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Water Intake</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={newWater.amount}
                    onChange={(e) => setNewWater({...newWater, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={newWater.unit} onValueChange={(value) => setNewWater({...newWater, unit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowWaterDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addWater}>
                    Add Water
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showMealDialog} onOpenChange={setShowMealDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Meal Type</Label>
                  <Select value={newMeal.meal_type} onValueChange={(value) => setNewMeal({...newMeal, meal_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Food Name</Label>
                  <Input
                    value={newMeal.food_name}
                    onChange={(e) => setNewMeal({...newMeal, food_name: e.target.value})}
                    placeholder="What did you eat?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Calories</Label>
                    <Input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal({...newMeal, fat: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Fiber (g)</Label>
                    <Input
                      type="number"
                      value={newMeal.fiber}
                      onChange={(e) => setNewMeal({...newMeal, fiber: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Sugar (g)</Label>
                    <Input
                      type="number"
                      value={newMeal.sugar}
                      onChange={(e) => setNewMeal({...newMeal, sugar: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({...newMeal, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowMealDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createMeal}>
                    Log Meal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Calories</span>
              <span className="text-sm text-gray-500">
                {dailyTotals.calories} / {currentGoals.daily_calories}
              </span>
            </div>
            <Progress 
              value={(dailyTotals.calories / currentGoals.daily_calories) * 100} 
              className="h-2 mb-2" 
            />
            <div className="text-xs text-gray-500">
              {Math.max(0, currentGoals.daily_calories - dailyTotals.calories)} remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Water ({currentGoals.water_unit})</span>
              <span className="text-sm text-gray-500">
                {totalWater} / {currentGoals.daily_water}
              </span>
            </div>
            <Progress 
              value={(totalWater / currentGoals.daily_water) * 100} 
              className="h-2 mb-2" 
            />
            <div className="text-xs text-gray-500">
              {Math.max(0, currentGoals.daily_water - totalWater)} remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Protein (g)</span>
              <span className="text-sm text-gray-500">
                {dailyTotals.protein.toFixed(1)} / {currentGoals.daily_protein}
              </span>
            </div>
            <Progress 
              value={(dailyTotals.protein / currentGoals.daily_protein) * 100} 
              className="h-2 mb-2" 
            />
            <div className="text-xs text-gray-500">
              {Math.max(0, currentGoals.daily_protein - dailyTotals.protein).toFixed(1)} remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Carbs (g)</span>
              <span className="text-sm text-gray-500">
                {dailyTotals.carbs.toFixed(1)} / {currentGoals.daily_carbs}
              </span>
            </div>
            <Progress 
              value={(dailyTotals.carbs / currentGoals.daily_carbs) * 100} 
              className="h-2 mb-2" 
            />
            <div className="text-xs text-gray-500">
              {Math.max(0, currentGoals.daily_carbs - dailyTotals.carbs).toFixed(1)} remaining
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                Today's Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meals.length > 0 ? (
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getMealTypeColor(meal.meal_type)}>
                              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {meal.time && format(new Date(`2000-01-01T${meal.time}`), 'h:mm a')}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{meal.food_name}</h4>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                            <div>Calories: {meal.calories || 0}</div>
                            <div>Protein: {meal.protein || 0}g</div>
                            <div>Carbs: {meal.carbs || 0}g</div>
                          </div>
                          {meal.notes && (
                            <p className="text-sm text-gray-500 mt-2">{meal.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMeal(meal.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Apple className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No meals logged today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Water Intake */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Water Intake
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {totalWater} {currentGoals.water_unit}
                </div>
                <div className="text-sm text-gray-500">
                  of {currentGoals.daily_water} {currentGoals.water_unit} goal
                </div>
              </div>
              <Progress 
                value={(totalWater / currentGoals.daily_water) * 100} 
                className="h-3 mb-4" 
              />
              {waterEntries.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Today's Entries:</h4>
                  {waterEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <span>
                        {entry.amount} {entry.unit}
                        {entry.time && ` at ${format(new Date(`2000-01-01T${entry.time}`), 'h:mm a')}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWaterEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}