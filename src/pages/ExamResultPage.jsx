import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Award, BarChart3, Clock, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { examsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const ExamResultPage = () => {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true)
        const resultData = await examsAPI.getExamResult(id)
        setResult(resultData)
      } catch (error) {
        console.error('Error fetching exam result:', error)
        toast({
          title: 'خطأ في تحميل النتيجة',
          description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchResult()
    }
  }, [id, toast])

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

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              النتيجة غير متاحة
            </h1>
            <Link to="/exams">
              <Button>
                العودة إلى الامتحانات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.totalScore) * 100)
  const isPassed = percentage >= 60

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isPassed ? 'مبروك! لقد نجحت في الامتحان' : 'للأسف، لم تحقق النسبة المطلوبة'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isPassed ? 'لقد أديت بشكل ممتاز في هذا الامتحان' : 'لا تيأس، حاول مرة أخرى'}
          </p>
        </motion.div>

        {/* Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">الدرجة</p>
              <p className="text-2xl font-bold">{result.score} / {result.totalScore}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">النسبة المئوية</p>
              <p className="text-2xl font-bold">{percentage}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">الوقت المستغرق</p>
              <p className="text-2xl font-bold">{result.timeSpent} دقيقة</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">تاريخ الإكمال</p>
              <p className="text-2xl font-bold">
                {new Date(result.completedAt).toLocaleDateString('ar-EG')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>تقدمك في الامتحان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">النسبة المئوية</span>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">الدرجة</span>
                <span className="text-sm font-medium">{result.score} / {result.totalScore}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        {result.questions && result.questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>مراجعة الأسئلة</CardTitle>
              <CardDescription>
                عرض الإجابات الصحيحة والخاطئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">السؤال {index + 1}: {question.text}</h3>
                    <div className="space-y-2">
                      <p className={`text-sm ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        إجابتك: {question.userAnswer || 'لم تتم الإجابة'}
                      </p>
                      {!question.isCorrect && (
                        <p className="text-sm text-green-600">
                          الإجابة الصحيحة: {question.correctAnswer}
                        </p>
                      )}
                      <div className="flex items-center">
                        {question.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 ml-1" />
                        )}
                        <span className="text-sm text-gray-500">
                          {question.isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center mt-8 space-x-4">
          <Link to="/exams">
            <Button variant="outline">
              العودة إلى الامتحانات
            </Button>
          </Link>
          {isPassed && (
            <Button>
              <Star className="h-4 w-4 ml-2" />
              عرض الشهادة
            </Button>
          )}
          <Button onClick={() => window.location.reload()}>
            تحديث النتيجة
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ExamResultPage