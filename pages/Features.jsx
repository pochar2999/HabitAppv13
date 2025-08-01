
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Calendar,
  BookOpen,
  Apple,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Star,
  Mail,
  Sun,
  List,
  Lock,
  ArrowRight,
  Dumbbell,
  Heart,
  RotateCcw,
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "To-Do List",
    description: "Organize your tasks and boost productivity",
    icon: CheckSquare,
    color: "bg-blue-500",
    url: "TodoList",
    category: "Productivity"
  },
  {
    title: "Calendar",
    description: "Schedule and track your important events",
    icon: Calendar,
    color: "bg-green-500",
    url: "Calendar",
    category: "Organization"
  },
  {
    title: "Journal",
    description: "Reflect on your thoughts and experiences",
    icon: BookOpen,
    color: "bg-purple-500",
    url: "Journal",
    category: "Wellness"
  },
  {
    title: "Food Tracker",
    description: "Monitor your nutrition and eating habits",
    icon: Apple,
    color: "bg-red-500",
    url: "FoodTracker",
    category: "Health"
  },
  {
    title: "Smart Finance Hub", // Changed title
    description: "Complete financial planning and budgeting system", // Changed description
    icon: DollarSign,
    color: "bg-emerald-500",
    url: "Finance",
    category: "Finance"
  },
  {
    title: "School Organizer",
    description: "Manage assignments and academic goals",
    icon: GraduationCap,
    color: "bg-indigo-500",
    url: "School",
    category: "Education"
  },
  {
    title: "Life Stats",
    description: "Visualize your personal data and progress",
    icon: TrendingUp,
    color: "bg-pink-500",
    url: "LifeStats",
    category: "Analytics"
  },
  {
    title: "Goals",
    description: "Set and track your personal objectives",
    icon: Star,
    color: "bg-yellow-500",
    url: "Goals",
    category: "Growth"
  },
  {
    title: "Letter to Future Self",
    description: "Write messages to your future self",
    icon: Mail,
    color: "bg-cyan-500",
    url: "FutureSelf",
    category: "Reflection"
  },
  {
    title: "Unpack My Day",
    description: "Reflect on your daily experiences",
    icon: Sun,
    color: "bg-orange-500",
    url: "UnpackDay",
    category: "Reflection"
  },
  {
    title: "Bucket List",
    description: "Keep track of life experiences and goals",
    icon: List,
    color: "bg-teal-500",
    url: "BucketList",
    category: "Life"
  },
  {
    title: "Password Vault",
    description: "Securely store your passwords and accounts",
    icon: Lock,
    color: "bg-gray-500",
    url: "PasswordVault",
    category: "Security"
  },
  {
    title: "Workout Tracker", // New feature
    description: "Plan routines and track your fitness progress",
    icon: Dumbbell,
    color: "bg-rose-500",
    url: "WorkoutTracker",
    category: "Fitness"
  },
  {
    title: "Gratitude Wall", // New feature
    description: "Share what you're grateful for on a digital board",
    icon: Heart,
    color: "bg-pink-400",
    url: "GratitudeWall",
    category: "Wellness"
  },
  {
    title: "Quote Vault",
    description: "Save and organize your favorite quotes",
    icon: MessageSquare,
    color: "bg-sky-500",
    url: "QuoteVault",
    category: "Growth"
  },
  {
    title: "Idea Vault",
    description: "Capture and develop your brilliant ideas",
    icon: Lightbulb,
    color: "bg-amber-500",
    url: "IdeaVault",
    category: "Productivity"
  },
  {
    title: "Reset Habits",
    description: "Start fresh by clearing all habit progress",
    icon: RotateCcw,
    color: "bg-red-500",
    url: "ResetHabits",
    category: "Settings"
  }
];

const categories = [...new Set(features.map(f => f.category))];

export default function Features() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          All Features
        </h1>
        <p className="text-xl text-gray-600">
          Comprehensive tools to help you live your best life
        </p>
      </div>

      {/* Features by Category */}
      {categories.map((category, categoryIndex) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            {category}
            <Badge variant="secondary" className="text-xs">
              {features.filter(f => f.category === category).length}
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features
              .filter(feature => feature.category === category)
              .map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                >
                  <Link to={createPageUrl(feature.url)}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                              {feature.title}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {feature.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
                          <span>Open Feature</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
