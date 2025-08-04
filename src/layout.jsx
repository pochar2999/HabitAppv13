import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { useAuth } from "./contexts/AuthContext";
import { User } from "./entities/User";
import { 
  Home, 
  Target, 
  BarChart3, 
  Settings, 
  Calendar,
  CheckSquare,
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
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Dumbbell,
  Heart,
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "My Habits", url: createPageUrl("Habits"), icon: Target },
  { title: "Progress", url: createPageUrl("Progress"), icon: BarChart3 },
  { title: "Features", url: createPageUrl("Features"), icon: Settings },
];

const mobileNavigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Habits", url: createPageUrl("Habits"), icon: Target },
  { title: "Progress", url: createPageUrl("Progress"), icon: BarChart3 },
  { title: "Features", url: createPageUrl("Features"), icon: Settings },
];

const featureItems = [
  { title: "To-Do List", url: createPageUrl("TodoList"), icon: CheckSquare },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  { title: "Journal", url: createPageUrl("Journal"), icon: BookOpen },
  { title: "Food Tracker", url: createPageUrl("FoodTracker"), icon: Apple },
  { title: "Finance Hub", url: createPageUrl("Finance"), icon: DollarSign },
  { title: "School", url: createPageUrl("School"), icon: GraduationCap },
  { title: "Life Stats", url: createPageUrl("LifeStats"), icon: TrendingUp },
  { title: "Goals", url: createPageUrl("Goals"), icon: Star },
  { title: "Future Self", url: createPageUrl("FutureSelf"), icon: Mail },
  { title: "Unpack Day", url: createPageUrl("UnpackDay"), icon: Sun },
  { title: "Bucket List", url: createPageUrl("BucketList"), icon: List },
  { title: "Password Vault", url: createPageUrl("PasswordVault"), icon: Lock },
  { title: "Workout Tracker", url: createPageUrl("WorkoutTracker"), icon: Dumbbell },
  { title: "Gratitude Wall", url: createPageUrl("GratitudeWall"), icon: Heart },
  { title: "Quote Vault", url: createPageUrl("QuoteVault"), icon: MessageSquare },
  { title: "Idea Vault", url: createPageUrl("IdeaVault"), icon: Lightbulb },
];

export default function Layout({ children, currentPageName }) {
  const { currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Load user data without blocking the UI
    if (currentUser) {
      loadUser();
    }
  }, [currentUser]);

  const loadUser = async () => {
    // Set basic user data immediately for faster UI rendering
    if (currentUser && !user) {
      setUser({
        id: currentUser.uid,
        email: currentUser.email,
        full_name: currentUser.displayName || 'User',
        profile_picture: currentUser.photoURL || null,
        emailVerified: true,
        loading: true
      });
    }
    
    try {
      if (currentUser) {
        const userData = await User.me(currentUser);
        setUser(prev => ({ ...userData, loading: false }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      
      // Update with offline status but don't block the UI
      if (currentUser) {
        setUser(prev => ({
          ...prev,
          id: currentUser.uid,
          email: currentUser.email,
          full_name: currentUser.displayName || 'User',
          profile_picture: currentUser.photoURL || null,
          emailVerified: true,
          offline: true,
          loading: false
        }));
      }
    }
  };

  // Set loading to false immediately after auth check
  useEffect(() => {
    if (currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // This check is now handled by App.jsx and ProtectedRoute
  if (!currentUser) {
    return null;
  }
  
  // Show layout immediately with basic user data
  const displayUser = user || {
    id: currentUser.uid,
    email: currentUser.email,
    full_name: currentUser.displayName || 'User',
    profile_picture: currentUser.photoURL || null,
    emailVerified: true
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style>{`
        :root {
          --primary: 59 130 246;
          --secondary: 147 51 234;
          --accent: 16 185 129;
          --background: 248 250 252;
          --card: 255 255 255;
          --text: 15 23 42;
          --text-muted: 100 116 139;
          --border: 226 232 240;
        }
        
        * {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        button, input, select, textarea {
          -webkit-appearance: none !important;
          appearance: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-border-radius: 0 !important;
          border-radius: 0.375rem !important;
        }
        
        input, select, textarea {
          font-size: 16px !important;
        }
        
        button {
          -webkit-appearance: none !important;
          appearance: none !important;
          background: none;
          border: none;
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(147, 51, 234));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @media (max-width: 768px) {
          .bg-white, .bg-gray-50, .bg-blue-50 {
            background-color: white !important;
          }
          
          .border-gray-200, .border-blue-200 {
            border-color: rgb(226, 232, 240) !important;
          }
          
          button:focus, button:active, button:hover,
          .cursor-pointer:focus, .cursor-pointer:active, .cursor-pointer:hover {
            background-color: initial !important;
            outline: none !important;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HabitAppV9</span>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={displayUser.profile_picture} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                      {displayUser.full_name?.[0] || displayUser.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="font-semibold">{displayUser.full_name || "User"}</p>
                  <p className="text-sm text-gray-500">{displayUser.email}</p>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">HabitAppV9</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-gray-700" />
              </Button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 py-4 border-b border-gray-200">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={displayUser.profile_picture} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {displayUser.full_name?.[0] || displayUser.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{displayUser.full_name || "User"}</p>
                  <p className="text-sm text-gray-500">{displayUser.email}</p>
                </div>
              </div>

              <nav className="py-4 space-y-2 border-b border-gray-200">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.url
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>

              <div className="py-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
                  Features
                </p>
                <div className="space-y-1">
                  {featureItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                        location.pathname === item.url
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 flex-col fixed inset-y-0 z-50">
          <div className="flex-1 flex flex-col min-h-0 glass-effect">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">HabitAppV9</h1>
                <p className="text-sm text-gray-500">Build better habits</p>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.url
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              
              <div className="pt-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
                  Features
                </p>
                <div className="space-y-1">
                  {featureItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                        location.pathname === item.url
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-3">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user.profile_picture} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {user.full_name?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{user.full_name || "User"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:ml-80 flex-1 min-h-screen pb-20 lg:pb-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-4">
          {mobileNavigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                location.pathname === item.url
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}