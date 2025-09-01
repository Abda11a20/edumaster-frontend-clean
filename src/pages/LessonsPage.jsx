import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Star, 
  BookOpen,
  Grid,
  List,
  SortAsc,
  SortDesc,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { lessonsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'

const LessonsPage = () => {
  const [lessons, setLessons] = useState([])
  const [filteredLessons, setFilteredLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClassLevel, setSelectedClassLevel] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState('asc')
  const [viewMode, setViewMode] = useState('grid')
  
  const { toast } = useToast()

  const classLevels = [
    { value: 'all', label: 'جميع المراحل' },
    { value: 'Grade 1 Secondary', label: 'الصف الأول الثانوي' },
    { value: 'Grade 2 Secondary', label: 'الصف الثاني الثانوي' },
    { value: 'Grade 3 Secondary', label: 'الصف الثالث الثانوي' }
  ]

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true)
        const response = await lessonsAPI.getAllLessons()
        const lessonsData = response?.lessons || response || []
        setLessons(lessonsData)
        setFilteredLessons(lessonsData)
      } catch (error) {
        console.error('Error fetching lessons:', error)
        toast({
          title: 'خطأ في تحميل الدروس',
          description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
  }, [toast])

  useEffect(() => {
    let filtered = lessons

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(lesson =>
        lesson.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by class level
    if (selectedClassLevel !== 'all') {
      filtered = filtered.filter(lesson => lesson.classLevel === selectedClassLevel)
    }

    // Sort lessons
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredLessons(filtered)
  }, [lessons, searchQuery, selectedClassLevel, sortBy, sortOrder])

  const handlePurchaseLesson = async (lessonId) => {
    try {
      await lessonsAPI.payForLesson(lessonId)
      toast({
        title: 'تم شراء الدرس بنجاح',
        description: 'يمكنك الآن الوصول إلى محتوى الدرس'
      })
    } catch (error) {
      toast({
        title: 'خطأ في شراء الدرس',
        description: error.message || 'حدث خطأ أثناء عملية الشراء',
        variant: 'destructive'
      })
    }
  }

  const LessonCard = ({ lesson, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {lesson.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              {lesson.classLevel}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Video Preview */}
            {lesson.video && (
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  45 دقيقة
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-1">4.8</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-1">120 طالب</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">{lesson.price}</span>
                <span className="text-sm text-gray-500 mr-1">ج.م</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Link to={`/lessons/${lesson._id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  عرض التفاصيل
                </Button>
              </Link>
              <Button 
                onClick={() => handlePurchaseLesson(lesson._id)}
                className="flex-1"
              >
                شراء الدرس
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const LessonListItem = ({ lesson, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{lesson.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                  {lesson.description}
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{lesson.classLevel}</Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 mr-1">4.8</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 mr-1">45 دقيقة</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">{lesson.price}</span>
                  <span className="text-sm text-gray-500 mr-1">ج.م</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link to={`/lessons/${lesson._id}`}>
                  <Button variant="outline" size="sm">
                    عرض التفاصيل
                  </Button>
                </Link>
                <Button 
                  size="sm"
                  onClick={() => handlePurchaseLesson(lesson._id)}
                >
                  شراء
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

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
            الدروس التعليمية
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اكتشف مجموعة واسعة من الدروس التفاعلية المصممة لمساعدتك في تحقيق أهدافك الأكاديمية
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث في الدروس..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Class Level Filter */}
                <Select value={selectedClassLevel} onValueChange={setSelectedClassLevel}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="المرحلة الدراسية" />
                  </SelectTrigger>
                  <SelectContent>
                    {classLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">العنوان</SelectItem>
                    <SelectItem value="price">السعر</SelectItem>
                    <SelectItem value="classLevel">المرحلة</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full md:w-auto"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>

                {/* View Mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600 dark:text-gray-300">
            عرض {filteredLessons.length} من {lessons.length} درس
          </p>
        </motion.div>

        {/* Lessons Grid/List */}
        {filteredLessons.length > 0 ? (
          <div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson, index) => (
                  <LessonCard key={lesson._id} lesson={lesson} index={index} />
                ))}
              </div>
            ) : (
              <div>
                {filteredLessons.map((lesson, index) => (
                  <LessonListItem key={lesson._id} lesson={lesson} index={index} />
                ))}
              </div>
            )}
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
              لا توجد دروس متاحة
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              جرب تغيير معايير البحث أو الفلترة
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedClassLevel('all')
            }}>
              إعادة تعيين الفلاتر
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LessonsPage

