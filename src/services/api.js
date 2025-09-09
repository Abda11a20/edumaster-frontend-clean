const API_BASE_URL = 'https://edu-master-delta.vercel.app'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return {
      'Content-Type': 'application/json'
    }
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'token': token
  }
}

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token')
    const error = new Error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى')
    error.status = 401
    throw error
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || errorData.error || `خطأ في الاتصال: ${response.status}`
    const error = new Error(errorMessage)
    error.status = response.status
    throw error
  }
  
  const data = await response.json()
  
  if (data.data !== undefined) {
    return data.data
  } else if (data.lessons !== undefined) {
    return data.lessons
  } else if (data.exams !== undefined) {
    return data.exams
  } else if (data.questions !== undefined) {
    return data.questions
  } else if (data.users !== undefined) {
    return data.users
  } else if (data.admins !== undefined) {
    return data.admins
  }
  
  return data
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = getAuthHeaders()
  
  const config = {
    headers,
    ...options
  }

  // تحويل body إلى JSON إذا كان كائنًا
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  } else if (options.body) {
    config.body = options.body
  }

  try {
    const response = await fetch(url, config)
    return await handleResponse(response)
  } catch (error) {
    if (error.message === 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى') {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      throw error
    }
    throw new Error(error.message || 'حدث خطأ في الاتصال بالخادم')
  }
}

export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    })
  },

  register: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: userData
    })
  },

  forgotPassword: async (email) => {
    return apiRequest('/user/forgot-password', {
      method: 'POST',
      body: { email }
    })
  },

  resetPassword: async (resetData) => {
    return apiRequest('/user/reset-password', {
      method: 'POST',
      body: resetData
    })
  },

  getProfile: async () => {
    const response = await apiRequest('/user/')
    return response.data || response
  },

  updateProfile: async (userId, profileData) => {
    return apiRequest(`/user/${userId}`, {
      method: 'PUT',
      body: profileData
    })
  },

  updatePassword: async (passwordData) => {
    return apiRequest('/user/update-password', {
      method: 'PATCH',
      body: passwordData
    })
  },

  deleteAccount: async () => {
    return apiRequest('/user/', {
      method: 'DELETE'
    })
  }
}

export const lessonsAPI = {
  getAllLessons: async ({ page = 1, limit = 10 } = {}) => {
    return apiRequest(`/lesson?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
  },

  getLessonById: async (id) => {
    return apiRequest(`/lesson/${id}`)
  },

  getPurchasedLessons: async () => {
    return apiRequest('/lesson/')
  },

  getUserProgress: async () => {
    return apiRequest('/lesson/progress')
  },

  payForLesson: async (lessonId) => {
    return apiRequest(`/lesson/pay/${lessonId}`, {
      method: 'POST'
    })
  },

  createLesson: async (lessonData) => {
    return apiRequest('/lesson', {
      method: 'POST',
      body: lessonData
    })
  },

  updateLesson: async (id, lessonData) => {
    return apiRequest(`/lesson/${id}`, {
      method: 'PUT',
      body: lessonData
    })
  },

  deleteLesson: async (id) => {
    return apiRequest(`/lesson/${id}`, {
      method: 'DELETE'
    })
  }
}

export const examsAPI = {
  getAllExams: async ({ page = 1, limit = 10 } = {}) => {
    return apiRequest(`/exam?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
  },

  getExamById: async (id) => {
    return apiRequest(`/exam/get/${id}`)
  },

  getUserProgress: async () => {
    return apiRequest('/studentExam/progress')
  },

  startExam: async (examId) => {
    return apiRequest(`/studentExam/start/${examId}`, {
      method: 'POST'
    })
  },

  submitExam: async (examId, answers) => {
    return apiRequest(`/studentExam/submit/${examId}`, {
      method: 'POST',
      body: answers
    })
  },

  getRemainingTime: async (examId) => {
    return apiRequest(`/studentExam/exams/remaining-time/${examId}`)
  },

  getExamScore: async (examId) => {
    return apiRequest(`/studentExam/exams/score/${examId}`)
  },

  getExamResult: async (examId) => {
    return apiRequest(`/studentExam/exams/${examId}`)
  },

  createExam: async (examData) => {
    return apiRequest('/exam', {
      method: 'POST',
      body: examData
    })
  },

  updateExam: async (id, examData) => {
    return apiRequest(`/exam/${id}`, {
      method: 'PUT',
      body: examData
    })
  },

  deleteExam: async (id) => {
    return apiRequest(`/exam/${id}`, {
      method: 'DELETE'
    })
  }
}

export const questionsAPI = {
  getAllQuestions: async ({ page = 1, limit = 10 } = {}) => {
    return apiRequest(`/question?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
  },

  getQuestionById: async (id) => {
    return apiRequest(`/question/get/${id}`)
  },

  createQuestion: async (questionData) => {
    return apiRequest('/question', {
      method: 'POST',
      body: questionData
    })
  },

  updateQuestion: async (id, questionData) => {
    return apiRequest(`/question/${id}`, {
      method: 'PUT',
      body: questionData
    })
  },

  deleteQuestion: async (id) => {
    return apiRequest(`/question/${id}`, {
      method: 'DELETE'
    })
  }
}

export const adminAPI = {
  createAdmin: async (adminData) => {
    return apiRequest('/admin/create-admin', {
      method: 'POST',
      body: adminData
    })
  },

  getAllAdmins: async () => {
    return apiRequest('/admin/all-admin')
  },

  getAllUsers: async () => {
    return apiRequest('/admin/all-user')
  },

  deleteUser: async (userId) => {
    return apiRequest(`/admin/delete-user/${userId}`, {
      method: 'DELETE'
    })
  },

  promoteToAdmin: async (userId) => {
    return apiRequest(`/admin/promote-to-admin/${userId}`, {
      method: 'PUT'
    })
  },

  demoteToUser: async (adminId) => {
    return apiRequest(`/admin/demote-to-user/${adminId}`, {
      method: 'PUT'
    })
  },

  deleteAdmin: async (adminId) => {
    return apiRequest(`/admin/delete-admin/${adminId}`, {
      method: 'DELETE'
    })
  }
}

export default {
  authAPI,
  lessonsAPI,
  examsAPI,
  questionsAPI,
  adminAPI
}