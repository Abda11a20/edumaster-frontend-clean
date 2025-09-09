import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, BarChart3, BookOpen, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { examsAPI } from '../services/api'
import { timeService } from '../services/timeService'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const ExamsPage = () => {
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const response = await examsAPI.getAllExams()
        
        // معالجة البيانات القادمة من الخادم
        let examsData = [];
        
        if (Array.isArray(response)) {
          examsData = response;
        } else if (response && typeof response === 'object') {
          // تحليل الهيكل المختلف للبيانات
          if (response.exams && Array.isArray(response.exams)) {
            examsData = response.exams;
          } else if (response.data && Array.isArray(response.data)) {
            examsData = response.data;
          } else {
            // إذا كان كائنًا واحدًا، حوّله إلى مصفوفة
            examsData = [response];
          }
        }
        
        // معالجة التواريخ لضمان صحتها
        const processedExams = examsData.map(exam => ({
          _id: exam._id,
          title: exam.title || 'بدون عنوان',
          description: exam.description || 'لا يوجد وصف',
          subject: exam.subject || exam.classLevel || 'غير محدد',
          duration: exam.duration || 0,
          questionsCount: exam.questionsCount || exam.numberOfQuestions || 0,
          totalScore: exam.totalScore || 100,
          deadline: exam.endDate || exam.deadline,
          startDate: exam.startDate,
          endDate: exam.endDate,
          isPublished: exam.isPublished || false
        }))
        
        setExams(processedExams)
        setFilteredExams(processedExams)
      } catch (error) {
        console.error('Error fetching exams:', error)
        toast({
          title: 'خطأ في تحميل الامتحانات',
          description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
          variant: 'destructive'
        })
        setExams([])
        setFilteredExams([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchExams()
  }, [toast])

  useEffect(() => {
    let filtered = Array.isArray(exams) ? exams.slice() : []
    
    // فلترة حسب حالة النشاط (لم تنته بعد)
    if (showActiveOnly) {
      const now = new Date()
      filtered = filtered.filter(exam => {
        if (!exam.endDate) return true // إذا لم يكن هناك تاريخ انتهاء، نعتبره نشطًا
        
        try {
          const endDate = new Date(exam.endDate)
          return endDate > now
        } catch (error) {
          console.error('Error parsing date:', error)
          return true // في حالة خطأ في التاريخ، نعرض الامتحان
        }
      })
    }
    
    // فلترة حسب البحث
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(exam =>
        String(exam.title || '').toLowerCase().includes(q) ||
        String(exam.description || '').toLowerCase().includes(q) ||
        String(exam.subject || '').toLowerCase().includes(q)
      )
    }
    
    setFilteredExams(filtered)
  }, [exams, searchQuery, showActiveOnly])

  const ExamCard = ({ exam, index }) => {
    const isActive = () => {
      if (!exam.endDate) return true
      try {
        const endDate = new Date(exam.endDate)
        return endDate > new Date()
      } catch (error) {
        return true
      }
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  {isActive() ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      نشط
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      منتهي
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {exam.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-2">
                {exam.subject}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* معلومات الامتحان */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                
                
                
                  
                
              </div>
              
              <div className="flex space-x-2">
                <Link to={`/exams/${exam._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    عرض التفاصيل
                  </Button>
                </Link>
                <Link to={`/exams/${exam._id}`} className="flex-1">
                  <Button className="w-full" disabled={!isActive()}>
                    بدء الامتحان
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            الامتحانات
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اختبر معرفتك من خلال الامتحانات التفاعلية
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الامتحانات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="active-only" className="text-sm text-gray-600 dark:text-gray-300">
                    عرض الامتحانات النشطة فقط
                  </Label>
                  <Switch
                    id="active-only"
                    checked={showActiveOnly}
                    onCheckedChange={setShowActiveOnly}
                  />
                </div>
                
                <Badge variant={showActiveOnly ? "default" : "outline"} className="ml-2">
                  {showActiveOnly ? "النشطة فقط" : "جميع الامتحانات"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-gray-600 dark:text-gray-300">
            عرض {filteredExams.length} من {exams.length} امتحان
          </p>
          
          {showActiveOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {filteredExams.length} امتحان نشط
            </Badge>
          )}
        </motion.div>

        {/* Exams Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-col-3 gap-6">
            {filteredExams.map((exam, index) => (
              <ExamCard key={exam._id} exam={exam} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {showActiveOnly ? 'لا توجد امتحانات نشطة' : 'لا توجد امتحانات متاحة'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {showActiveOnly ? 'جرب إلغاء فلتر "النشطة فقط" لعرض جميع الامتحانات' : 'جرب تغيير معايير البحث'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ExamsPage