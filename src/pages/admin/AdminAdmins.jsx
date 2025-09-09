import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, UserPlus, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Navbar from '../../components/Navbar'

const AdminAdmins = () => {
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    cpassword: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.fullName && admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAdmins(filtered)
  }, [searchTerm, admins])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [adminsResponse, usersResponse] = await Promise.all([
        adminAPI.getAllAdmins(),
        adminAPI.getAllUsers()
      ])
      
      // معالجة استجابة المشرفين
      let adminsArray = []
      if (Array.isArray(adminsResponse)) {
        adminsArray = adminsResponse
      } else if (adminsResponse && Array.isArray(adminsResponse.admins)) {
        adminsArray = adminsResponse.admins
      } else if (adminsResponse && Array.isArray(adminsResponse.data)) {
        adminsArray = adminsResponse.data
      }
      
      // معالجة استجابة المستخدمين
      let usersArray = []
      if (Array.isArray(usersResponse)) {
        usersArray = usersResponse
      } else if (usersResponse && Array.isArray(usersResponse.users)) {
        usersArray = usersResponse.users
      } else if (usersResponse && Array.isArray(usersResponse.data)) {
        usersArray = usersResponse.data
      }
      
      setAdmins(adminsArray)
      setFilteredAdmins(adminsArray)
      setUsers(usersArray)
    } catch (error) {
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
        variant: 'destructive'
      })
      setAdmins([])
      setFilteredAdmins([])
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formData.password !== formData.cpassword) {
        toast({
          title: 'خطأ',
          description: 'كلمة المرور وتأكيدها غير متطابقتين',
          variant: 'destructive'
        })
        return
      }

      await adminAPI.createAdmin(formData)
      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة المشرف بنجاح'
      })
      setIsDialogOpen(false)
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        cpassword: ''
      })
      fetchData()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة المشرف',
        variant: 'destructive'
      })
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                إدارة المشرفين
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إضافة وعرض المشرفين في النظام
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مشرف جديد
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشرفين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
              <p className="text-xs text-muted-foreground">عدد المشرفين في النظام</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">عدد المستخدمين في النظام</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة المشرفين</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.length > 0 ? ((admins.length / users.length) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">نسبة المشرفين إلى المستخدمين</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>قائمة المشرفين</CardTitle>
                <CardDescription>
                  جميع المشرفين في النظام
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>تاريخ الانضمام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell className="font-medium">{admin.fullName}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phoneNumber || 'غير متاح'}</TableCell>
                      <TableCell>
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('ar-EG') : 'غير معروف'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      لا توجد مشرفين متاحين
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog for Add Admin */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>إضافة مشرف جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="cpassword"
                      type="password"
                      value={formData.cpassword}
                      onChange={(e) => setFormData({ ...formData, cpassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit">
                      إضافة
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAdmins