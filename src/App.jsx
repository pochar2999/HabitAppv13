import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../layout'
import Home from '../pages/Home'
import Habits from '../pages/Habits'
import HabitSelect from '../pages/HabitSelect'
import HabitDetail from '../pages/HabitDetails'
import HabitForm from '../pages/HabitForm'
import Progress from '../pages/Progress'
import Features from '../pages/Features'
import TodoList from '../pages/ToDoList'
import Calendar from '../pages/Calender'
import Journal from '../pages/Journal'
import FoodTracker from '../pages/FoodTracker'
import Finance from '../pages/Finance'
import School from '../pages/School'
import LifeStats from '../pages/LIfeStats'
import Goals from '../pages/Goals'
import FutureSelf from '../pages/Futureself'
import UnpackDay from '../pages/UnpackmyDay'
import BucketList from '../pages/BucketList'
import PasswordVault from '../pages/PasswardVault'
import WorkoutTracker from '../pages/Workout'
import GratitudeWall from '../pages/GradWall'
import QuoteVault from '../pages/QuoteVault'
import IdeaVault from '../pages/IdeaVault'
import ResetHabits from '../pages/ResetHabit'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habit-select" element={<HabitSelect />} />
          <Route path="/habit-detail" element={<HabitDetail />} />
          <Route path="/habit-form" element={<HabitForm />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/features" element={<Features />} />
          <Route path="/todo-list" element={<TodoList />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/food-tracker" element={<FoodTracker />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/school" element={<School />} />
          <Route path="/life-stats" element={<LifeStats />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/future-self" element={<FutureSelf />} />
          <Route path="/unpack-day" element={<UnpackDay />} />
          <Route path="/bucket-list" element={<BucketList />} />
          <Route path="/password-vault" element={<PasswordVault />} />
          <Route path="/workout-tracker" element={<WorkoutTracker />} />
          <Route path="/gratitude-wall" element={<GratitudeWall />} />
          <Route path="/quote-vault" element={<QuoteVault />} />
          <Route path="/idea-vault" element={<IdeaVault />} />
          <Route path="/reset-habits" element={<ResetHabits />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App