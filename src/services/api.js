const API_BASE_URL = 'https://edu-master-delta.vercel.app'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { token })
  }
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: getAuthHeaders(),
    ...options
  }

  const response = await fetch(url, config)
  return handleResponse(response)
}

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  register: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  forgotPassword: async (email) => {
    return apiRequest('/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  resetPassword: async (resetData) => {
    return apiRequest('/user/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData)
    })
  },

  getProfile: async () => {
    return apiRequest('/user/')
  },

  updateProfile: async (profileData) => {
    return apiRequest('/user/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  },

  updatePassword: async (passwordData) => {
    return apiRequest('/user/update-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData)
    })
  },

  deleteAccount: async () => {
    return apiRequest('/user/', {
      method: 'DELETE'
    })
  }
}

// Lessons API
export const lessonsAPI = {
  getAllLessons: async () => {
    return apiRequest('/lesson/')
  },

  getLessonById: async (id) => {
    return apiRequest(`/lesson/${id}`)
  },

  getPurchasedLessons: async () => {
    return apiRequest('/lesson/')
  },

  payForLesson: async (lessonId) => {
    return apiRequest(`/lesson/pay/${lessonId}`, {
      method: 'POST'
    })
  },

  // Admin only
  createLesson: async (lessonData) => {
    return apiRequest('/lesson', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    })
  },

  updateLesson: async (id, lessonData) => {
    return apiRequest(`/lesson/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData)
    })
  },

  deleteLesson: async (id) => {
    return apiRequest(`/lesson/${id}`, {
      method: 'DELETE'
    })
  }
}

// Exams API
export const examsAPI = {
  getAllExams: async () => {
    return apiRequest('/exam')
  },

  getExamById: async (id) => {
    return apiRequest(`/exam/get/${id}`)
  },

  startExam: async (examId) => {
    return apiRequest(`/studentExam/start/${examId}`, {
      method: 'POST'
    })
  },

  submitExam: async (examId, answers) => {
    return apiRequest(`/studentExam/submit/${examId}`, {
      method: 'POST',
      body: JSON.stringify({ answers })
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

  // Admin only
  createExam: async (examData) => {
    return apiRequest('/exam', {
      method: 'POST',
      body: JSON.stringify(examData)
    })
  },

  updateExam: async (id, examData) => {
    return apiRequest(`/exam/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    })
  },

  deleteExam: async (id) => {
    return apiRequest(`/exam/${id}`, {
      method: 'DELETE'
    })
  }
}

// Questions API
export const questionsAPI = {
  getAllQuestions: async () => {
    return apiRequest('/question')
  },

  getQuestionById: async (id) => {
    return apiRequest(`/question/get/${id}`)
  },

  // Admin only
  createQuestion: async (questionData) => {
    return apiRequest('/question', {
      method: 'POST',
      body: JSON.stringify(questionData)
    })
  },

  updateQuestion: async (id, questionData) => {
    return apiRequest(`/question/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    })
  },

  deleteQuestion: async (id) => {
    return apiRequest(`/question/${id}`, {
      method: 'DELETE'
    })
  }
}

// Admin API
export const adminAPI = {
  createAdmin: async (adminData) => {
    return apiRequest('/admin/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData)
    })
  },

  getAllAdmins: async () => {
    return apiRequest('/admin/all-admin')
  },

  getAllUsers: async () => {
    return apiRequest('/admin/all-user')
  }
}

export default {
  authAPI,
  lessonsAPI,
  examsAPI,
  questionsAPI,
  adminAPI
}

