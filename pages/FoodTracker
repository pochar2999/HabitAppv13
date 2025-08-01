
import React, { useState, useEffect } from "react";
import { MealEntry } from "@/entities/MealEntry";
import { WaterEntry } from "@/entities/WaterEntry";
import { NutritionGoals } from "@/entities/NutritionGoals";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Apple, 
  Droplets, 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  Clock,
  TrendingUp,
  Settings,
  Flame, // Added Flame icon
  ArrowLeft // Added ArrowLeft icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns"; // Added parseISO
import { Link } from "react-router-dom"; // Added Link
import { createPageUrl } from "@/utils"; // Added createPageUrl
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"; // Added Recharts imports

const mealTypes = [
  { value: "breakfast", label: "Breakfast", color: "bg-yellow-100 text-yellow-800" },
  { value: "lunch", label: "Lunch", color: "bg-green-100 text-green-800" },
  { value: "dinner", label: "Dinner", color: "bg-blue-100 text-blue-800" },
  { value: "snack", label: "Snack", color: "bg-purple-100 text-purple-800" }
];

export default function FoodTracker() {
  const [meals, setMeals] = useState([]);
  const [waterEntries, setWaterEntries] = useState([]);
  const [goals, setGoals] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [showWaterDialog, setShowWaterDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [newMeal, setNewMeal] = useState({
    meal_type: "breakfast",
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm")
  });

  const [newWater, setNewWater] = useState({
    amount: "",
    unit: "oz",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm")
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [mealData, waterData, goalsData] = await Promise.all([
        MealEntry.filter({ user_id: userData.id }),
        WaterEntry.filter({ user_id: userData.id }),
        NutritionGoals.filter({ user_id: userData.id })
      ]);
      
      setMeals(mealData.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)));
      setWaterEntries(waterData.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)));
      
      if (goalsData.length > 0) {
        setGoals(goalsData[0]);
      } else {
        // Create default goals
        const defaultGoals = await NutritionGoals.create({ user_id: userData.id });
        setGoals(defaultGoals);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleCreateMeal = async () => {
    try {
      const mealToCreate = {
        ...newMeal,
        user_id: user.id,
        calories: newMeal.calories ? parseInt(newMeal.calories, 10) : null,
        protein: newMeal.protein ? parseInt(newMeal.protein, 10) : null,
        carbs: newMeal.carbs ? parseInt(newMeal.carbs, 10) : null,
        fat: newMeal.fat ? parseInt(newMeal.fat, 10) : null,
        fiber: newMeal.fiber ? parseInt(newMeal.fiber, 10) : null,
        sugar: newMeal.sugar ? parseInt(newMeal.sugar, 10) : null,
      };
      await MealEntry.create(mealToCreate);
      setNewMeal({
        meal_type: "breakfast",
        food_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sugar: "",
        notes: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm")
      });
      setShowMealDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating meal:", error);
    }
  };

  const handleUpdateMeal = async () => {
    try {
      const mealToUpdate = {
        ...editingMeal,
        calories: editingMeal.calories ? parseInt(editingMeal.calories, 10) : null,
        protein: editingMeal.protein ? parseInt(editingMeal.protein, 10) : null,
        carbs: editingMeal.carbs ? parseInt(editingMeal.carbs, 10) : null,
        fat: editingMeal.fat ? parseInt(editingMeal.fat, 10) : null,
        fiber: editingMeal.fiber ? parseInt(editingMeal.fiber, 10) : null,
        sugar: editingMeal.sugar ? parseInt(editingMeal.sugar, 10) : null,
      };
      await MealEntry.update(mealToUpdate.id, mealToUpdate);
      setEditingMeal(null);
      setShowMealDialog(false);
      loadData();
    } catch (error) {
      console.error("Error updating meal:", error);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await MealEntry.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const handleAddWater = async () => {
    try {
      await WaterEntry.create({ ...newWater, user_id: user.id });
      setNewWater({
        amount: "",
        unit: goals?.water_unit || "oz",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm")
      });
      setShowWaterDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const handleDeleteWater = async (id) => {
    try {
      await WaterEntry.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting water entry:", error);
    }
  };

  const handleUpdateGoals = async () => {
    try {
      await NutritionGoals.update(goals.id, goals);
      setShowGoalsDialog(false);
      loadData();
    } catch (error) {
      console.error("Error updating goals:", error);
    }
  };

  const getTodayMeals = () => {
    return meals.filter(meal => meal.date === selectedDate);
  };

  const getTodayWater = () => {
    return waterEntries.filter(entry => entry.date === selectedDate);
  };

  const calculateDailyNutrition = () => {
    const todayMeals = getTodayMeals();
    return todayMeals.reduce((totals, meal) => ({
      calories: totals.calories + (meal.calories || 0),
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
      fiber: totals.fiber + (meal.fiber || 0),
      sugar: totals.sugar + (meal.sugar || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });
  };

  const calculateDailyWater = () => {
    const todayWater = getTodayWater();
    return todayWater.reduce((total, entry) => {
      let amount = entry.amount;
      // Convert to ounces if needed
      if (entry.unit === "ml" && goals?.water_unit === "oz") {
        amount = amount * 0.033814;
      } else if (entry.unit === "oz" && goals?.water_unit === "ml") {
        amount = amount * 29.5735;
      }
      return total + amount;
    }, 0);
  };

  const nutrition = calculateDailyNutrition();
  const waterIntake = calculateDailyWater();
  const waterProgress = goals ? (waterIntake / goals.daily_water) * 100 : 0;

  const getMealTypeInfo = (type) => {
    return mealTypes.find(mt => mt.value === type) || mealTypes[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6"> {/* Changed max-w-6xl to max-w-7xl */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"> {/* Added new div for alignment */}
          <Link to={createPageUrl("Features")}> {/* Added Link to Features page */}
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div> {/* Wrapped existing header text in a div */}
            <h1 className="text-3xl font-bold text-gray-900">Food & Water Tracker</h1>
            <p className="text-gray-600 mt-1">Monitor your nutrition and hydration goals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
          <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Goals
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nutrition Goals</DialogTitle>
              </DialogHeader>
              {goals && (
                <div className="space-y-4">
                  <div>
                    <Label>Daily Calories</Label>
                    <Input
                      type="number"
                      value={goals.daily_calories}
                      onChange={(e) => setGoals({...goals, daily_calories: parseInt(e.target.value)})}
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
                    <Label>Daily Water ({goals.water_unit})</Label>
                    <Input
                      type="number"
                      value={goals.daily_water}
                      onChange={(e) => setGoals({...goals, daily_water: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Water Unit</Label>
                    <Select
                      value={goals.water_unit}
                      onValueChange={(value) => setGoals({...goals, water_unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oz">Ounces</SelectItem>
                        <SelectItem value="ml">Milliliters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateGoals} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Save Goals
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-red-500" />
              Daily Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calories</span>
                    <span>{nutrition.calories} / {goals.daily_calories}</span>
                  </div>
                  <Progress value={(nutrition.calories / goals.daily_calories) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Protein</span>
                    <span>{nutrition.protein}g / {goals.daily_protein}g</span>
                  </div>
                  <Progress value={(nutrition.protein / goals.daily_protein) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbs</span>
                    <span>{nutrition.carbs}g / {goals.daily_carbs}g</span>
                  </div>
                  <Progress value={(nutrition.carbs / goals.daily_carbs) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat</span>
                    <span>{nutrition.fat}g / {goals.daily_fat}g</span>
                  </div>
                  <Progress value={(nutrition.fat / goals.daily_fat) * 100} className="h-2" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Water Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(waterIntake)} {goals?.water_unit || "oz"}
              </div>
              <div className="text-sm text-gray-600">
                Goal: {goals?.daily_water || 64} {goals?.water_unit || "oz"}
              </div>
              <Progress value={Math.min(waterProgress, 100)} className="h-3" />
              <div className="text-sm text-gray-600">
                {waterProgress >= 100 ? "🎉 Goal achieved!" : `${Math.round(100 - waterProgress)}% to go`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="meals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Today's Meals</h2>
            <Dialog open={showMealDialog} onOpenChange={setShowMealDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingMeal(null);
                    setNewMeal({
                      meal_type: "breakfast",
                      food_name: "",
                      calories: "",
                      protein: "",
                      carbs: "",
                      fat: "",
                      fiber: "",
                      sugar: "",
                      notes: "",
                      date: selectedDate,
                      time: format(new Date(), "HH:mm")
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMeal ? "Edit Meal" : "Log New Meal"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Meal Type</Label>
                    <Select
                      value={editingMeal ? editingMeal.meal_type : newMeal.meal_type}
                      onValueChange={(value) => {
                        if (editingMeal) {
                          setEditingMeal({ ...editingMeal, meal_type: value });
                        } else {
                          setNewMeal({ ...newMeal, meal_type: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Food Name *</Label>
                    <Input
                      value={editingMeal ? editingMeal.food_name : newMeal.food_name}
                      onChange={(e) => {
                        if (editingMeal) {
                          setEditingMeal({ ...editingMeal, food_name: e.target.value });
                        } else {
                          setNewMeal({ ...newMeal, food_name: e.target.value });
                        }
                      }}
                      placeholder="What did you eat?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Calories</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.calories : newMeal.calories}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, calories: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, calories: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.protein : newMeal.protein}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, protein: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, protein: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.carbs : newMeal.carbs}
                        onChange={(e) => {
                           if (editingMeal) {
                            setEditingMeal({ ...editingMeal, carbs: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, carbs: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Fat (g)</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.fat : newMeal.fat}
                        onChange={(e) => {
                           if (editingMeal) {
                            setEditingMeal({ ...editingMeal, fat: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, fat: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fiber (g)</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.fiber : newMeal.fiber}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, fiber: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, fiber: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Sugar (g)</Label>
                      <Input
                        type="number"
                        value={editingMeal ? editingMeal.sugar : newMeal.sugar}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, sugar: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, sugar: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={editingMeal ? editingMeal.date : newMeal.date}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, date: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, date: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={editingMeal ? editingMeal.time : newMeal.time}
                        onChange={(e) => {
                          if (editingMeal) {
                            setEditingMeal({ ...editingMeal, time: e.target.value });
                          } else {
                            setNewMeal({ ...newMeal, time: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={editingMeal ? editingMeal.notes : newMeal.notes}
                      onChange={(e) => {
                        if (editingMeal) {
                          setEditingMeal({ ...editingMeal, notes: e.target.value });
                        } else {
                          setNewMeal({ ...newMeal, notes: e.target.value });
                        }
                      }}
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowMealDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingMeal ? handleUpdateMeal : handleCreateMeal}
                      disabled={
                        editingMeal 
                          ? !editingMeal.food_name
                          : !newMeal.food_name
                      }
                       className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editingMeal ? "Update" : "Log Meal"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {getTodayMeals().map((meal, index) => {
                const mealType = getMealTypeInfo(meal.meal_type);
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={mealType.color}>
                                {mealType.label}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(`2000-01-01T${meal.time}`), "h:mm a")}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{meal.food_name}</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              {meal.calories !== null && meal.calories !== undefined && (
                                <div>Calories: {meal.calories}</div>
                              )}
                              {meal.protein !== null && meal.protein !== undefined && (
                                <div>Protein: {meal.protein}g</div>
                              )}
                              {meal.carbs !== null && meal.carbs !== undefined && (
                                <div>Carbs: {meal.carbs}g</div>
                              )}
                              {meal.fat !== null && meal.fat !== undefined && (
                                <div>Fat: {meal.fat}g</div>
                              )}
                              {meal.fiber !== null && meal.fiber !== undefined && (
                                <div>Fiber: {meal.fiber}g</div>
                              )}
                              {meal.sugar !== null && meal.sugar !== undefined && (
                                <div>Sugar: {meal.sugar}g</div>
                              )}
                            </div>
                            
                            {meal.notes && (
                              <p className="text-gray-600 text-sm mt-2">{meal.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMeal(meal);
                                setShowMealDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {getTodayMeals().length === 0 && (
              <div className="text-center py-12">
                <Apple className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meals logged today</h3>
                <p className="text-gray-600 mb-6">Start tracking your nutrition by logging your first meal!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Water Tab */}
        <TabsContent value="water" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Water Intake</h2>
            <Dialog open={showWaterDialog} onOpenChange={setShowWaterDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Water
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Water Intake</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      value={newWater.amount}
                      onChange={(e) => setNewWater({ ...newWater, amount: parseInt(e.target.value) || 0 })}
                      placeholder="How much water?"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Select
                      value={newWater.unit}
                      onValueChange={(value) => setNewWater({ ...newWater, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newWater.date}
                        onChange={(e) => setNewWater({ ...newWater, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newWater.time}
                        onChange={(e) => setNewWater({ ...newWater, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWaterDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddWater}
                      disabled={!newWater.amount}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Log Water
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {getTodayWater().map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Droplets className="w-8 h-8 text-blue-500" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {entry.amount} {entry.unit}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(`2000-01-01T${entry.time}`), "h:mm a")}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWater(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {getTodayWater().length === 0 && (
              <div className="text-center py-12">
                <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No water logged today</h3>
                <p className="text-gray-600 mb-6">Start tracking your hydration by logging your first glass!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
