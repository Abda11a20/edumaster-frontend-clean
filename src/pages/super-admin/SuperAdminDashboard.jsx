// SuperAdminDashboard.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Shield, 
  BarChart3,
  Search,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Navbar from '../../components/Navbar'
import ProtectedRoute from '../../components/ProtectedRoute'
import CreateAdminModal from '../../components/CreateAdminModal'

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('admins')
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setIsLoading(true)
      if (activeTab === 'admins') {
        const adminsData = await adminAPI.getAllAdmins()
        setAdmins(adminsData)
      } else {
        const usersData = await adminAPI.getAllUsers()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async (adminData) => {
    try {
      await adminAPI.createAdmin(adminData)
      toast({
        title: 'تم إنشاء الأدمن بنجاح',
        description: 'تمت إضافة الأدمن الجديد إلى النظام'
      })
      setIsCreateModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error creating admin:', error)
      toast({
        title: 'خطأ في إنشاء الأدمن',
        description: error.message || 'حدث خطأ أثناء إنشاء الأدمن',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    
    try {
      await adminAPI.deleteUser(userId)
      toast({
        title: 'تم حذف المستخدم',
        description: 'تم حذف المستخدم بنجاح'
      })
      loadData()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'خطأ في الحذف',
        description: error.message || 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive'
      })
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ProtectedRoute>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  لوحة تحكم السوبر أدمن
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  إدارة الأدمن والمستخدمين في النظام
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4 ml-2" />
                  إنشاء أدمن جديد
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">عدد الأدمن</p>
                    <p className="text-2xl font-bold">{admins.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">عدد المستخدمين</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">المجموع الكلي</p>
                    <p className="text-2xl font-bold">{admins.length + users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع الأدمن والمستخدمين في النظام
                  </CardDescription>
                </div>
                
                <div className="mt-4 md:mt-0 md:w-64">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="admins">
                    <Shield className="h-4 w-4 ml-2" />
                    الأدمن
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users className="h-4 w-4 ml-2" />
                    المستخدمين
                  </TabsTrigger>
                </TabsList>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="admins">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">الاسم</th>
                              <th className="text-right p-3">البريد الإلكتروني</th>
                              <th className="text-right p-3">رقم الهاتف</th>
                              <th className="text-right p-3">تاريخ الإنشاء</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdmins.map((admin) => (
                              <tr key={admin._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-3">{admin.fullName}</td>
                                <td className="p-3">{admin.email}</td>
                                <td className="p-3">{admin.phoneNumber}</td>
                                <td className="p-3">
                                  {new Date(admin.createdAt).toLocaleDateString('ar-EG')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {filteredAdmins.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            لا توجد بيانات للأدمن
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="users">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-3">الاسم</th>
                              <th className="text-right p-3">البريد الإلكتروني</th>
                              <th className="text-right p-3">رقم الهاتف</th>
                              <th className="text-right p-3">تاريخ التسجيل</th>
                              <th className="text-right p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-3">{user.fullName}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.phoneNumber}</td>
                                <td className="p-3">
                                  {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                                </td>
                                <td className="p-3">
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeleteUser(user._id)}
                                    >
                                      <Trash2 className="h-4 w-4 ml-1" />
                                      حذف
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {filteredUsers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            لا توجد بيانات للمستخدمين
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Create Admin Modal */}
        <CreateAdminModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAdmin}
        />
      </div>
    </ProtectedRoute>
  )
}

export default SuperAdminDashboard