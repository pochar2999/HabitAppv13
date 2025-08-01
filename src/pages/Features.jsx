import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  Dumbbell,
  Heart,
  MessageSquare,
  Lightbulb,
  Target
} from "lucide-react";

const features = [
  {
    title: "To-Do List",
    description: "Organize your tasks and stay productive",
    icon: CheckSquare,
    url: createPageUrl("TodoList"),
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Calendar",
    description: "Schedule events and manage your time",
    icon: Calendar,
    url: createPageUrl("Calendar"),
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600"
  },
  {
    title: "Journal",
    description: "Reflect on your thoughts and experiences",
    icon: BookOpen,
    url: createPageUrl("Journal"),
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Food Tracker",
    description: "Monitor your nutrition and eating habits",
    icon: Apple,
    url: createPageUrl("FoodTracker"),
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    title: "Finance Hub",
    description: "Manage your money and financial goals",
    icon: DollarSign,
    url: createPageUrl("Finance"),
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    title: "School",
    description: "Track assignments and academic progress",
    icon: GraduationCap,
    url: createPageUrl("School"),
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    iconColor: "text-indigo-600"
  },
  {
    title: "Life Stats",
    description: "Visualize your personal analytics",
    icon: TrendingUp,
    url: createPageUrl("LifeStats"),
    color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
    iconColor: "text-pink-600"
  },
  {
    title: "Goals",
    description: "Set and track your personal objectives",
    icon: Star,
    url: createPageUrl("Goals"),
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    title: "Future Self",
    description: "Write letters to your future self",
    icon: Mail,
    url: createPageUrl("FutureSelf"),
    color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    iconColor: "text-cyan-600"
  },
  {
    title: "Unpack Day",
    description: "Daily reflection and mindfulness",
    icon: Sun,
    url: createPageUrl("UnpackDay"),
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600"
  },
  {
    title: "Bucket List",
    description: "Track your life goals and dreams",
    icon: List,
    url: createPageUrl("BucketList"),
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    iconColor: "text-teal-600"
  },
  {
    title: "Password Vault",
    description: "Securely store your passwords",
    icon: Lock,
    url: createPageUrl("PasswordVault"),
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600"
  },
  {
    title: "Workout Tracker",
    description: "Log your fitness activities",
    icon: Dumbbell,
    url: createPageUrl("WorkoutTracker"),
    color: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    iconColor: "text-violet-600"
  },
  {
    title: "Gratitude Wall",
    description: "Practice gratitude daily",
    icon: Heart,
    url: createPageUrl("GratitudeWall"),
    color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
    iconColor: "text-rose-600"
  },
  {
    title: "Quote Vault",
    description: "Save inspiring quotes",
    icon: MessageSquare,
    url: createPageUrl("QuoteVault"),
    color: "bg-slate-50 border-slate-200 hover:bg-slate-100",
    iconColor: "text-slate-600"
  },
  {
    title: "Idea Vault",
    description: "Capture and organize your ideas",
    icon: Lightbulb,
    url: createPageUrl("IdeaVault"),
    color: "bg-lime-50 border-lime-200 hover:bg-lime-100",
    iconColor: "text-lime-600"
  }
];

export default function Features() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Features</h1>
        <p className="text-xl text-gray-600">
          Explore all the tools available to help you build better habits and improve your life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} to={feature.url}>
            <Card className={`transition-all duration-300 cursor-pointer group ${feature.color}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/50">
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">
            Choose a feature above to begin your journey towards better habits and personal growth.
          </p>
          <Link to={createPageUrl("HabitSelect")}>
            <Badge className="bg-blue-600 text-white px-6 py-2 text-sm hover:bg-blue-700 cursor-pointer">
              Start Building Habits
            </Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}