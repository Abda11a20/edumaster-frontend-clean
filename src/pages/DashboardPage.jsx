import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Star,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'
import { lessonsAPI, examsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const DashboardPage = () => {
  const { user, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    totalPoints: 0
  })
  const [purchasedLessons, setPurchasedLessons] = useState([])
  const [availableExams, setAvailableExams] = useState([])
  const [completedExams, setCompletedExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLessonsModal, setShowLessonsModal] = useState(false)
  const [showExamsModal, setShowExamsModal] = useState(false)
  const [allPurchasedLessons, setAllPurchasedLessons] = useState([])
  const [allFilteredExams, setAllFilteredExams] = useState([])

  // توجيه السوبر أدمن مباشرة إلى لوحة التحكم الخاصة به
  useEffect(() => {
    if (isSuperAdmin()) {
      navigate('/super-admin', { replace: true })
      return
    }
  }, [isSuperAdmin, navigate])

  useEffect(() => {
    const fetchDashboardData = async () => {
      // إذا كان المستخدم سوبر أدمن، لا نحمل البيانات
      if (isSuperAdmin()) return
      
      try {
        setIsLoading(true)
        
        // جلب البيانات من API
        const [
          lessonsResponse, 
          purchasedResponse, 
          examsResponse
        ] = await Promise.all([
          lessonsAPI.getAllLessons(),
          lessonsAPI.getPurchasedLessons(),
          examsAPI.getAllExams()
        ])

        // معالجة بيانات الدروس
        const totalLessons = Array.isArray(lessonsResponse) 
          ? lessonsResponse.length 
          : (lessonsResponse?.lessons?.length || lessonsResponse?.data?.length || 0)
        
        const purchasedLessonsData = Array.isArray(purchasedResponse) 
          ? purchasedResponse 
          : (purchasedResponse?.lessons || purchasedResponse?.data || [])
        
        setAllPurchasedLessons(purchasedLessonsData)
        
        // حساب الدروس المكتملة
        const completedLessonsCount = purchasedLessonsData.filter(
          lesson => lesson.watched === true
        ).length

        // معالجة بيانات الامتحانات
        const allExams = Array.isArray(examsResponse) 
          ? examsResponse 
          : (examsResponse?.exams || examsResponse?.data || [])
        
        const now = new Date()
        
        // تصفية الامتحانات المتاحة (لم تنته بعد وتناسب مستوى الطالب)
        const userClassLevel = user?.classLevel || ''
        const availableExamsData = allExams.filter(exam => {
          // التحقق من تاريخ الانتهاء
          const isActive = !exam.endDate || new Date(exam.endDate) > now
          
          // التحقق من مستوى الصف إذا كان متوفرًا
          const matchesLevel = !userClassLevel || !exam.classLevel || 
                              exam.classLevel === userClassLevel
          
          return isActive && matchesLevel
        })
        
        setAllFilteredExams(availableExamsData)
        
        // حساب الامتحانات المكتملة (هنا يمكنك استخدام API خاص إذا كان متوفراً)
        const completedExamsData = allExams.filter(exam => exam.isCompleted === true)
        const completedExamsCount = completedExamsData.length
        
        // حساب متوسط الدرجات (هنا يمكنك استخدام API خاص إذا كان متوفراً)
        let averageScore = 0
        if (completedExamsCount > 0) {
          const totalScore = completedExamsData.reduce((sum, exam) => sum + (exam.score || 0), 0)
          averageScore = Math.round(totalScore / completedExamsCount)
        }
        
        // حساب النقاط (5 نقاط لكل درس مكتمل + 10 نقاط لكل امتحان مكتمل)
        const totalPoints = (completedLessonsCount * 5) + (completedExamsCount * 10)

        // تحديث الإحصائيات
        setStats({
          totalLessons,
          completedLessons: completedLessonsCount,
          totalExams: allExams.length,
          completedExams: completedExamsCount,
          averageScore,
          totalPoints
        })

        // تحديث الدروس المشتراة للعرض
        setPurchasedLessons(purchasedLessonsData.slice(0, 3))
        
        // تحديث الامتحانات المتاحة للعرض
        setAvailableExams(availableExamsData.slice(0, 3))
        
        // تحديث الامتحانات المكتملة للعرض
        setCompletedExams(completedExamsData.slice(0, 3))
        
      } catch (error) {
        // استخدام بيانات وهمية للاختبار
        setStats({
          totalLessons: 12,
          completedLessons: 4,
          totalExams: 8,
          completedExams: 2,
          averageScore: 85,
          totalPoints: 40
        })
        setPurchasedLessons([
          { _id: '1', title: 'الدرس الأول', classLevel: 'الصف الأول', watched: true },
          { _id: '2', title: 'الدرس الثاني', classLevel: 'الصف الأول', watched: false }
        ])
        setAvailableExams([
          { _id: '1', title: 'امتحان الرياضيات', duration: 30, classLevel: 'الصف الأول' },
          { _id: '2', title: 'امتحان العلوم', duration: 45, classLevel: 'الصف الأول' }
        ])
        setCompletedExams([
          { _id: '3', title: 'امتحان اللغة العربية', score: 85 }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (user && !isSuperAdmin()) {
      fetchDashboardData()
    }
  }, [user, isSuperAdmin])

  // إذا كان المستخدم سوبر أدمن، لا نعرض أي محتوى
  if (isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const progressPercentage = stats.completedLessons > 0 
    ? Math.min((stats.completedLessons / 5) * 100, 100)
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
                  <p className="text-purple-100 text-sm">الامتحانات المكتملة</p>
                  <p className="text-3xl font-bold">{stats.completedExams}</p>
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
                        {Math.min(stats.completedLessons, 5)} من 5
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">الهدف الشهري</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">5</p>
                      <p className="text-xs text-gray-500">دروس</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium">الهدف الشهري</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">10</p>
                      <p className="text-xs text-gray-500">امتحانات</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">النقاط المكتسبة</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalPoints}</p>
                    <p className="text-xs text-gray-500">نقطة هذا الشهر</p>
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
            {/* كارد الدروس المشتراة - ثابت مع جملة تشجيعية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  تقدمك في التعلم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <Target className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">استمر في التقدم!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    لقد أكملت {stats.completedLessons} من أصل {stats.totalLessons} درساً. استمر في التعلم لتحقيق أهدافك.
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">دروس مكتملة</span>
                      <span className="text-sm font-bold text-green-600">{stats.completedLessons}</span>
                    </div>
                    <Progress value={(stats.completedLessons / stats.totalLessons) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* كارد الامتحانات - يعرض عدد الامتحانات فقط */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  الامتحانات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <FileText className="h-7 w-7 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {allFilteredExams.length}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      امتحان متاح حالياً
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500">
                        استعد واختبر معرفتك لتحقيق النجاح
                      </p>
                    </div>
                  </div>
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