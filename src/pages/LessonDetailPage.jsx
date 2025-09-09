import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Clock, User, CreditCard, Check, Loader, ExternalLink, Play, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { lessonsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const LessonDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const { toast } = useToast()

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true)
        const lessonData = await lessonsAPI.getLessonById(id)
        setLesson(lessonData)
        
        // التحقق إذا كان المستخدم قد اشترى الدرس بالفعل
        const purchasedLessons = await lessonsAPI.getPurchasedLessons()
        const isAlreadyPurchased = purchasedLessons.some(l => l._id === id)
        setIsPurchased(isAlreadyPurchased)
      } catch (error) {
        console.error('Error fetching lesson data:', error)
        toast({
          title: 'خطأ في تحميل البيانات',
          description: 'فشل في تحميل معلومات الدرس',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessonData()
  }, [id, toast])

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true)
      
      // استدعاء API لشراء الدرس
      const response = await lessonsAPI.payForLesson(id)
      
      if (response.success && response.paymentUrl) {
        // فتح رابط الدفع في نافذة جديدة
        window.open(response.paymentUrl, '_blank', 'noopener,noreferrer')
        
        toast({
          title: 'تم توجيهك إلى صفحة الدفع',
          description: 'يرجى إكمال عملية الدفع في النافذة الجديدة',
          variant: 'default'
        })
      } else {
        throw new Error('لم يتم إنشاء رابط الدفع')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast({
        title: 'خطأ في عملية الشراء',
        description: 'حدث خطأ أثناء توجيهك إلى صفحة الدفع',
        variant: 'destructive'
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleStartLearning = () => {
    // الانتقال إلى مشاهدة الدرس
    if (lesson?.videoUrl) {
      // يمكنك تنفيذ الانتقال إلى صفحة المشاهدة أو فتح الفيديو في modal
      window.open(lesson.videoUrl, '_blank')
    }
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

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 dark:text-gray-300">الدرس غير موجود</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary">{lesson.classLevel}</Badge>
            <Badge variant="outline">{lesson.duration} دقيقة</Badge>
            {lesson.category && <Badge variant="secondary">{lesson.category}</Badge>}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {lesson.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
            {lesson.teacher && (
              <div className="flex items-center">
                <User className="h-4 w-4 ml-1" />
                <span>مدرس: {lesson.teacher}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              <span>تم النشر: {new Date(lesson.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* محتوى الدرس */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* مشغل الفيديو */}
            {isPurchased && lesson.videoUrl ? (
              <Card>
                <CardHeader>
                  <CardTitle>مشاهدة الدرس</CardTitle>
                  <CardDescription>
                    يمكنك الآن مشاهدة محتوى الدرس بالكامل
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full"
                      poster={lesson.thumbnail || ''}
                    >
                      <source src={lesson.videoUrl} type="video/mp4" />
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleStartLearning}>
                      <Play className="h-4 w-4 ml-2" />
                      تشغيل الفيديو
                    </Button>
                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <Button variant="outline">
                        <Download className="h-4 w-4 ml-2" />
                        تحميل المواد
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Play className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">محتوى مقفل</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    يرجى شراء الدرس لمشاهدة المحتوى الكامل والوصول إلى الفيديو
                  </p>
                  <Button onClick={handlePurchase} disabled={isPurchasing}>
                    {isPurchasing ? (
                      <>
                        <Loader className="h-4 w-4 ml-2 animate-spin" />
                        جاري التوجيه إلى الدفع...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 ml-2" />
                        شراء الدرس
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* وصف الدرس */}
            <Card>
              <CardHeader>
                <CardTitle>وصف الدرس</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {lesson.description || 'لا يوجد وصف للدرس'}
                </p>
              </CardContent>
            </Card>

            {/* معلومات الدرس */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الدرس</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">محتوى الدرس</TabsTrigger>
                    <TabsTrigger value="resources">المواد المرفقة</TabsTrigger>
                    <TabsTrigger value="info">معلومات إضافية</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content">
                    <div className="prose dark:prose-invert max-w-none">
                      {lesson.content || 'لا يوجد محتوى مفصل للدرس حالياً.'}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="resources">
                    {lesson.attachments && lesson.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {lesson.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 ml-2 text-gray-500" />
                              <span>{attachment.name}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 ml-1" />
                              تحميل
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">لا توجد مواد مرفقة لهذا الدرس</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="info">
                    <div className="space-y-4">
                      {lesson.objectives && (
                        <div>
                          <h4 className="font-medium mb-2">أهداف الدرس</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {lesson.objectives.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {lesson.requirements && (
                        <div>
                          <h4 className="font-medium mb-2">المتطلبات المسبقة</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {lesson.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* معلومات الشراء */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>تفاصيل الاشتراك</CardTitle>
                <CardDescription>
                  احصل على وصول كامل إلى هذا الدرس
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">السعر</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {lesson.price} ج.م
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Play className="h-4 w-4 ml-2 text-green-500" />
                      فيديو كامل للدرس
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <BookOpen className="h-4 w-4 ml-2 text-blue-500" />
                      وصول كامل إلى المحتوى
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <FileText className="h-4 w-4 ml-2 text-purple-500" />
                      مواد تعليمية قابلة للتحميل
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 ml-2 text-orange-500" />
                      {lesson.duration} دقيقة من المحتوى
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader className="h-4 w-4 ml-2 animate-spin" />
                        جاري التوجيه إلى الدفع...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 ml-2" />
                        شراء الآن
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetailPage