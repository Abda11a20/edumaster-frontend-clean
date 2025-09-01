import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  FileText, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Play,
  Calendar,
  Target,
  Star,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { lessonsAPI, examsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0
  })
  const [recentLessons, setRecentLessons] = useState([])
  const [upcomingExams, setUpcomingExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch lessons and exams data
        const [lessonsResponse, examsResponse] = await Promise.all([
          lessonsAPI.getAllLessons(),
          examsAPI.getAllExams()
        ])

        // Calculate stats
        const totalLessons = lessonsResponse?.lessons?.length || 0
        const totalExams = examsResponse?.exams?.length || 0
        
        setStats({
          totalLessons,
          completedLessons: Math.floor(totalLessons * 0.6), // Mock data
          totalExams,
          completedExams: Math.floor(totalExams * 0.4), // Mock data
          averageScore: 85 // Mock data
        })

        // Set recent lessons (first 3)
        setRecentLessons(lessonsResponse?.lessons?.slice(0, 3) || [])
        
        // Set upcoming exams (first 3)
        setUpcomingExams(examsResponse?.exams?.slice(0, 3) || [])
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const progressPercentage = stats.totalLessons > 0 
    ? (stats.completedLessons / stats.totalLessons) * 100 
    : 0

  const quickActions = [
    {
      title: 'تصفح الدروس',
      description: 'استكشف المحتوى التعليمي',
      icon: BookOpen,
      link: '/lessons',
      color: 'bg-blue-500'
    },
    {
      title: 'الامتحانات',
      description: 'اختبر معلوماتك',
      icon: FileText,
      link: '/exams',
      color: 'bg-green-500'
    },
    {
      title: 'الملف الشخصي',
      description: 'إدارة حسابك',
      icon: Award,
      link: '/profile',
      color: 'bg-purple-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            مرحباً، {user?.fullName || 'الطالب'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            استمر في رحلتك التعليمية وحقق أهدافك الأكاديمية
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الدروس</p>
                  <p className="text-3xl font-bold">{stats.totalLessons}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">الدروس المكتملة</p>
                  <p className="text-3xl font-bold">{stats.completedLessons}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">الامتحانات</p>
                  <p className="text-3xl font-bold">{stats.totalExams}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">متوسط الدرجات</p>
                  <p className="text-3xl font-bold">{stats.averageScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  تقدمك الأكاديمي
                </CardTitle>
                <CardDescription>
                  تتبع إنجازاتك ومستوى تقدمك في المنهج
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">إكمال الدروس</span>
                      <span className="text-sm text-gray-500">
                        {stats.completedLessons} من {stats.totalLessons}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">الهدف الشهري</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">20</p>
                      <p className="text-xs text-gray-500">درس مكتمل</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium">النقاط المكتسبة</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">1,250</p>
                      <p className="text-xs text-gray-500">نقطة هذا الشهر</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
                <CardDescription>
                  الوصول السريع للأقسام المهمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recent Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    أحدث الدروس
                  </span>
                  <Link to="/lessons">
                    <Button variant="ghost" size="sm">
                      عرض الكل
                      <ArrowRight className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLessons.length > 0 ? (
                    recentLessons.map((lesson, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          <Play className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{lesson.title}</h4>
                          <p className="text-xs text-gray-500">{lesson.classLevel}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {lesson.price} ج.م
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">لا توجد دروس متاحة</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Exams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    الامتحانات القادمة
                  </span>
                  <Link to="/exams">
                    <Button variant="ghost" size="sm">
                      عرض الكل
                      <ArrowRight className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingExams.length > 0 ? (
                    upcomingExams.map((exam, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{exam.title}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {exam.duration} دقيقة
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {exam.classLevel}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">لا توجد امتحانات قادمة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

