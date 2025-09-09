import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Navbar from '../components/Navbar'

const PaymentSuccessPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    toast({
      title: 'تم الدفع بنجاح',
      description: 'تم شراء الدرس بنجاح، يمكنك الآن الوصول إليه',
      variant: 'default'
    })
  }, [toast])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            تمت العملية بنجاح!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            تم شراء الدرس بنجاح، يمكنك الآن البدء في التعلم
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle>ماذا بعد؟</CardTitle>
              <CardDescription>
                ابدأ رحلتك التعليمية الآن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 ml-3" />
                  <div>
                    <h3 className="font-medium">الوصول إلى المحتوى</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      يمكنك الآن الوصول إلى جميع مواد الدرس
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400 ml-3" />
                  <div>
                    <h3 className="font-medium">متابعة التقدم</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      تتبع تقدمك في لوحة التحكم الخاصة بك
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/lessons/${id}`)}
                >
                  <BookOpen className="h-4 w-4 ml-2" />
                  الانتقال إلى الدرس
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/lessons')}
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  تصفح المزيد من الدروس
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage