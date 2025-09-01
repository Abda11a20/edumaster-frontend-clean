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

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const userData = await authAPI.getProfile()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Failed to get user profile:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: newToken, user: userData } = response
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
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
      const response = await authAPI.updateProfile(profileData)
      setUser(response)
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
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

