import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { UserHabit } from "@/entities/UserHabit";
import { HabitLog } from "@/entities/HabitLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function ResetHabits() {
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleReset = async () => {
    if (confirmText !== "RESET") {
      alert("Please type 'RESET' to confirm");
      return;
    }

    setLoading(true);
    try {
      const userData = await User.me();
      
      // Get all user habits
      const userHabits = await UserHabit.filter({ user_id: userData.id });
      
      // Delete all habit logs for this user
      const allLogs = await HabitLog.list();
      const userLogs = allLogs.filter(log => 
        userHabits.some(uh => uh.id === log.user_habit_id)
      );
      
      // Delete logs one by one
      for (const log of userLogs) {
        await HabitLog.delete(log.id);
      }
      
      // Delete all user habits
      for (const userHabit of userHabits) {
        await UserHabit.delete(userHabit.id);
      }
      
      // Reset user XP and level
      await User.update(userData.id, {
        xp: 0,
        level: 1
      });
      
      setResetComplete(true);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error resetting habits:", error);
      alert("There was an error resetting your habits. Please try again.");
    }
    setLoading(false);
  };

  if (resetComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reset Complete</h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your habits have been reset successfully!
          </h2>
          <p className="text-gray-600 mb-8">
            All your habit progress, logs, and stats have been cleared. You can now start fresh with new habits.
          </p>
          <div className="space-y-4">
            <Link to={createPageUrl("Home")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white mr-4">
                Go to Home
              </Button>
            </Link>
            <Link to={createPageUrl("HabitSelect?type=build")}>
              <Button variant="outline">
                Add New Habits
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Features")}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Habits</h1>
          <p className="text-gray-600 mt-1">
            Start fresh by clearing all your habit data
          </p>
        </div>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Warning: This Action Cannot Be Undone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              This will permanently delete all of your habit data including:
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">What will be deleted:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                All your active habits
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Complete habit completion history
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                All streak records (current and longest)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Progress statistics and analytics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                XP points and level (reset to Level 1)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                All habit logs and notes
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What will NOT be deleted:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Your account and profile information</li>
              <li>• Other app features (Journal, To-Do, Calendar, etc.)</li>
              <li>• The available habit library</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Habits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-700">Confirm Habit Reset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    This action will permanently delete all your habit data. This cannot be undone.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type "RESET" to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Type RESET here"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowConfirmDialog(false);
                        setConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleReset}
                      disabled={loading || confirmText !== "RESET"}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? "Resetting..." : "Reset Everything"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Why reset?</h3>
              <p className="text-green-700 text-sm mt-1">
                Sometimes starting fresh can be motivating. Maybe you want to try different habits, 
                reset your approach, or simply clear the slate for a new beginning. That's totally normal!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
