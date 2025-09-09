import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, UserPlus, Users, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { adminAPI, lessonsAPI, examsAPI, questionsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Navbar from '../../components/Navbar'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    lessonsCount: 0,
    examsCount: 0,
    questionsCount: 0,
    adminsCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [usersResponse, adminsResponse, lessonsResponse, examsResponse, questionsResponse] = await Promise.allSettled([
        adminAPI.getAllUsers(),
        adminAPI.getAllAdmins(),
        lessonsAPI.getAllLessons(),
        examsAPI.getAllExams(),
        questionsAPI.getAllQuestions()
      ])

      // استخراج البيانات من الاستجابات مع التعامل مع الأخطاء
      const usersCount = usersResponse.status === 'fulfilled' ? 
        (Array.isArray(usersResponse.value) ? usersResponse.value.length : 0) : 0
      
      const adminsCount = adminsResponse.status === 'fulfilled' ? 
        (Array.isArray(adminsResponse.value) ? adminsResponse.value.length : 0) : 0
      
      const lessonsCount = lessonsResponse.status === 'fulfilled' ? 
        (Array.isArray(lessonsResponse.value) ? lessonsResponse.value.length : 0) : 0
      
      const examsCount = examsResponse.status === 'fulfilled' ? 
        (Array.isArray(examsResponse.value) ? examsResponse.value.length : 0) : 0
      
      const questionsCount = questionsResponse.status === 'fulfilled' ? 
        (Array.isArray(questionsResponse.value) ? questionsResponse.value.length : 0) : 0

      // التحقق من وجود أخطاء في الطلبات
      const errors = []
      if (usersResponse.status === 'rejected') {
        console.error('Error fetching users:', usersResponse.reason)
        errors.push('المستخدمين')
      }
      if (adminsResponse.status === 'rejected') {
        console.error('Error fetching admins:', adminsResponse.reason)
        errors.push('المشرفين')
      }
      if (lessonsResponse.status === 'rejected') {
        console.error('Error fetching lessons:', lessonsResponse.reason)
        errors.push('الدروس')
      }
      if (examsResponse.status === 'rejected') {
        console.error('Error fetching exams:', examsResponse.reason)
        errors.push('الامتحانات')
      }
      if (questionsResponse.status === 'rejected') {
        console.error('Error fetching questions:', questionsResponse.reason)
        errors.push('الأسئلة')
      }

      if (errors.length > 0) {
        setError(`فشل في تحميل: ${errors.join('، ')}. قد يكون بسبب عدم وجود صلاحية الوصول.`)
      }

      setStats({
        usersCount,
        adminsCount,
        lessonsCount,
        examsCount,
        questionsCount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('حدث خطأ في تحميل البيانات. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.')
      
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRetry = () => {
    fetchDashboardData()
  }

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              لوحة تحكم الإدارة
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              نظرة عامة على النظام والإحصائيات
            </p>
          </div>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث البيانات
          </Button>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-2" onClick={handleRetry}>
                حاول مرة أخرى
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usersCount}</div>
              <p className="text-xs text-muted-foreground">إجمالي المستخدمين المسجلين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشرفين</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminsCount}</div>
              <p className="text-xs text-muted-foreground">إجمالي المشرفين في النظام</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الدروس</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lessonsCount}</div>
              <p className="text-xs text-muted-foreground">إجمالي الدروس المتاحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الامتحانات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.examsCount}</div>
              <p className="text-xs text-muted-foreground">إجمالي الامتحانات المتاحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأسئلة</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.questionsCount}</div>
              <p className="text-xs text-muted-foreground">إجمالي الأسئلة في النظام</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات السريعة</CardTitle>
              <CardDescription>نظرة عامة على أداء النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">نسبة إكمال الدروس</span>
                  <span className="text-sm">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">متوسط نتائج الامتحانات</span>
                  <span className="text-sm">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">مستخدمين نشطين</span>
                  <span className="text-sm">{Math.floor(stats.usersCount * 0.6)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
              <CardDescription>إدارة سريعة للنظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/lessons" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block">
                  <div className="font-medium text-sm">إدارة الدروس</div>
                </Link>
                <Link to="/admin/exams" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block">
                  <div className="font-medium text-sm">إدارة الامتحانات</div>
                </Link>
                // ... في قسم الإجراءات السريعة
                <Link to="/admin/questions" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block">
                  <div className="font-medium text-sm">إدارة الأسئلة</div>
                </Link>
                <Link to="/admin/admins" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block">
                  <div className="font-medium text-sm">إدارة المشرفين</div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard