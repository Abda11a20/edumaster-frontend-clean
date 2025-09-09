import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { examsAPI, questionsAPI } from '../services/api'
import { timeService } from '../services/timeService'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const TakeExamPage = () => {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [remainingTime, setRemainingTime] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const timerRef = useRef(null)

  // دالة لجلب تفاصيل الأسئلة
  const fetchQuestionsDetails = async (questionIdsOrObjects) => {
    try {
      if (!questionIdsOrObjects || questionIdsOrObjects.length === 0) {
        return []
      }

      if (questionIdsOrObjects[0] && questionIdsOrObjects[0].text) {
        return questionIdsOrObjects.map(q => ({
          _id: q._id || q.id,
          text: q.text || q.title || '',
          type: q.type || 'multipleChoice',
          options: q.options || q.choices || [],
          correctAnswer: q.correctAnswer || '',
          points: q.points || 1
        }))
      }

      const ids = questionIdsOrObjects.map(q => (typeof q === 'string' ? q : (q._id || q.id))).filter(Boolean)
      const questionsPromises = ids.map(qid => 
        questionsAPI.getQuestionById(qid).catch(error => {
          console.error(`Error fetching question ${qid}:`, error)
          return null
        })
      )

      const questionsResponses = await Promise.all(questionsPromises)

      return questionsResponses
        .filter(response => response !== null)
        .map(response => {
          const questionData = response.data || response
          return {
            _id: questionData._id || questionData.id,
            text: questionData.text || questionData.title || '',
            type: questionData.type || 'multipleChoice',
            options: questionData.options || questionData.choices || [],
            correctAnswer: questionData.correctAnswer || '',
            points: questionData.points || 1
          }
        })
    } catch (error) {
      console.error('Error fetching questions details:', error)
      return []
    }
  }

  useEffect(() => {
    const startExam = async () => {
      try {
        setIsLoading(true)
        const response = await examsAPI.startExam(id)
        console.log('Exam start response:', response)

        const examData = response.data?.data || response.data || response
        setExam(examData.exam)

        let questionList = examData.exam?.questions ?? []

        const questionsDetails = await fetchQuestionsDetails(questionList)
        setQuestions(questionsDetails)

        const initialAnswers = {}
        questionsDetails.forEach(question => {
          if (question && question._id) {
            initialAnswers[question._id] = question.type === 'essay' ? '' : null
          }
        })
        setAnswers(initialAnswers)

        try {
          const timeResponse = await examsAPI.getRemainingTime(id)
          const timeData = timeResponse.data?.data ?? timeResponse.data ?? timeResponse
          console.log('Raw time response:', timeData)

          let remainingTimeValue = 0

          if (timeData.remainingTime && typeof timeData.remainingTime === 'object') {
            const { minutes, seconds } = timeData.remainingTime
            remainingTimeValue = (parseInt(minutes) * 60) + parseInt(seconds)
          } else if (typeof timeData.remainingTime === 'number') {
            remainingTimeValue = timeData.remainingTime
          } else if (timeData.expiresAt) {
            const expires = new Date(timeData.expiresAt)
            const now = new Date()
            const diffSeconds = Math.floor((expires - now) / 1000)
            remainingTimeValue = diffSeconds
          } else {
            remainingTimeValue = (examData.exam.duration || 60) * 60
          }

          console.log('Remaining time calc:', remainingTimeValue)

          if (remainingTimeValue <= 0) {
            setTimeExpired(true)
            setRemainingTime(0)
          } else {
            setRemainingTime(Math.max(0, Math.floor(remainingTimeValue)))
          }
        } catch (timeError) {
          console.error('Error getting remaining time:', timeError)
          const defaultTime = (examData.exam.duration || 60) * 60
          setRemainingTime(defaultTime)
        }
      } catch (error) {
        console.error('Error starting exam:', error)
        toast({
          title: 'خطأ في بدء الامتحان',
          description: error.message || 'لا يمكن بدء الامتحان الآن',
          variant: 'destructive'
        })
        navigate(`/exams/${id}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      startExam()
    }
  }, [id])

  useEffect(() => {
    if (remainingTime <= 0 || timeExpired) {
      if (remainingTime <= 0 && !timeExpired) {
        setTimeExpired(true)
        handleAutoSubmit()
      }
      return
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setTimeExpired(true)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [remainingTime, timeExpired])

  const handleAutoSubmit = async () => {
    if (isSubmitting) return

    toast({
      title: 'انتهى وقت الامتحان',
      description: 'جاري إرسال إجاباتك تلقائياً...',
      variant: 'default'
    })

    await handleSubmitExam(true)
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleEssayAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (timeExpired && !isAutoSubmit) {
      toast({
        title: 'انتهى وقت الامتحان',
        description: 'لا يمكن إرسال الإجابات بعد انتهاء الوقت',
        variant: 'destructive'
      })
      return
    }

    const unansweredRequiredQuestions = questions.filter(question => {
      const answer = answers[question._id]
      return (question.type === 'multipleChoice' && (answer === null || answer === '')) ||
             (question.type === 'essay' && (answer === null || answer === ''))
    })

    if (unansweredRequiredQuestions.length > 0 && !isAutoSubmit) {
      const confirmSubmit = window.confirm(
        `لديك ${unansweredRequiredQuestions.length} أسئلة لم تتم الإجابة عليها. هل تريد بالتأكيد إنهاء الامتحان؟`
      )

      if (!confirmSubmit) {
        return
      }
    }

    try {
      setIsSubmitting(true)

      const answersArray = Object.entries(answers)
        .filter(([_, answer]) => answer !== null && answer !== '')
        .map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer
        }));

      const submitData = { answers: answersArray };

      console.log('Submitting exam data:', submitData);

      const response = await examsAPI.submitExam(id, submitData);

      toast({
        title: 'تم إرسال الامتحان',
        description: 'تم تقديم إجاباتك بنجاح'
      })

      navigate(`/exams/${id}/result`)
    } catch (error) {
      console.error('Error submitting exam:', error)

      let errorMessage = 'فشل في إرسال الإجابات';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'خطأ في إرسال الامتحان',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    return timeService.formatTimeForDisplay(seconds);
  }

  const answeredQuestions = Object.values(answers).filter(answer => answer !== null && answer !== '').length
  const totalQuestions = questions.length

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

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              الامتحان غير موجود
            </h1>
            <Button onClick={() => navigate('/exams')}>
              العودة إلى الامتحانات
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {exam.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {exam.description}
            </p>
          </div>

          <div className="flex items-center mt-4 md:mt-0">
            <Clock className="h-6 w-6 text-red-500 ml-2" />
            <span className="text-xl font-bold text-red-500">
              {formatTime(remainingTime)}
            </span>
            {timeExpired && (
              <span className="text-sm text-red-500 mr-2">(انتهى الوقت)</span>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 ml-2" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">تنبيه هام</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                لا تقم بتحديث الصفحة أو الخروج منها أثناء الامتحان، فقد يؤدي ذلك إلى فقدان تقدمك.
                {timeExpired && ' انتهى وقت الامتحان، سيتم إرسال إجاباتك تلقائياً.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <motion.div
                key={question._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      السؤال {index + 1}: {question.text || 'بدون نص'}
                      {question.type === 'essay' && (
                        <span className="text-sm text-blue-500 mr-2"> (سؤال مقالي)</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {question.type === 'multipleChoice' ? (
                      <RadioGroup
                        value={answers[question._id] ?? ''}
                        onValueChange={(value) => handleAnswerChange(question._id, value)}
                        disabled={timeExpired}
                      >
                        {question.options && question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 space-x-reverse mb-2">
                            <RadioGroupItem 
                              value={option} 
                              id={`${question._id}-${optIndex}`}
                              disabled={timeExpired}
                            />
                            <Label htmlFor={`${question._id}-${optIndex}`} className="cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        placeholder="اكتب إجابتك هنا..."
                        value={answers[question._id] ?? ''}
                        onChange={(e) => handleEssayAnswerChange(question._id, e.target.value)}
                        disabled={timeExpired}
                        className="min-h-32"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد أسئلة متاحة لهذا الامتحان</p>
            </div>
          )}
        </div>

        {questions.length > 0 && !timeExpired && (
          <div className="fixed bottom-4 right-4">
            <Button
              size="lg"
              onClick={() => handleSubmitExam(false)}
              disabled={isSubmitting}
              className="shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 ml-2" />
                  إنهاء الامتحان
                </>
              )}
            </Button>
          </div>
        )}

        {questions.length > 0 && (
          <div className="fixed bottom-4 left-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {answeredQuestions} / {totalQuestions} أسئلة تمت الإجابة عليها
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TakeExamPage
