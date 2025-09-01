import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import ExamsPage from './pages/ExamsPage'
import ExamDetailPage from './pages/ExamDetailPage'
import TakeExamPage from './pages/TakeExamPage'
import ExamResultPage from './pages/ExamResultPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLessons from './pages/admin/AdminLessons'
import AdminExams from './pages/admin/AdminExams'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAdmins from './pages/admin/AdminAdmins'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/lessons" element={
                <ProtectedRoute>
                  <LessonsPage />
                </ProtectedRoute>
              } />
              <Route path="/lessons/:id" element={
                <ProtectedRoute>
                  <LessonDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/exams" element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              } />
              <Route path="/exams/:id" element={
                <ProtectedRoute>
                  <ExamDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/exams/:id/take" element={
                <ProtectedRoute>
                  <TakeExamPage />
                </ProtectedRoute>
              } />
              <Route path="/exams/:id/result" element={
                <ProtectedRoute>
                  <ExamResultPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/lessons" element={
                <AdminRoute>
                  <AdminLessons />
                </AdminRoute>
              } />
              <Route path="/admin/exams" element={
                <AdminRoute>
                  <AdminExams />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/admins" element={
                <AdminRoute>
                  <AdminAdmins />
                </AdminRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

