import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // دالة للتحقق من صحة التوكن
  const validateToken = async (storedToken) => {
    try {
      const userData = await authAPI.getProfile()
      setUser(userData)
      setToken(storedToken)
      return true
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      return false
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        await validateToken(storedToken)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      
      let authToken, userData;
      
      if (response.data && response.token) {
        authToken = response.token;
        userData = response.data;
      } else if (response.token && response.user) {
        authToken = response.token;
        userData = response.user;
      } else {
        authToken = response.token;
        userData = response;
      }
      
      localStorage.setItem('token', authToken)
      setToken(authToken)
      setUser(userData)
      
      return { success: true, data: response }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'فشل في تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (resetData) => {
    try {
      const response = await authAPI.resetPassword(resetData)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const userId = user?._id
      
      if (!userId) {
        throw new Error('User ID is not available')
      }

      const response = await authAPI.updateProfile(userId, profileData)
      setUser(prev => ({ ...prev, ...profileData }))
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (passwordData) => {
    try {
      const response = await authAPI.updatePassword(passwordData)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin === true
  }

  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN'
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    isAdmin,
    isSuperAdmin,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}