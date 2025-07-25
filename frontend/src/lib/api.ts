import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add request timestamp
      (config as any).metadata = { startTime: new Date() };
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (process.env.NODE_ENV === 'development') {
        const endTime = new Date();
        const startTime = (response.config as any).metadata?.startTime;
        if (startTime) {
          const duration = endTime.getTime() - startTime.getTime();
          console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
        }
      }

      return response;
    },
    (error) => {
      // Handle common error scenarios
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      } else if (error.response?.status === 403) {
        // Forbidden - show error message
        console.error('Access forbidden:', error.response.data);
      } else if (error.response?.status >= 500) {
        // Server error - show generic error message
        console.error('Server error:', error.response.data);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        console.error('Request timeout');
      } else if (!error.response) {
        // Network error
        console.error('Network error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create the main API client
export const apiClient = createApiClient();

// Generic API request wrapper
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error: any) {
    // Return standardized error response
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'An error occurred',
      message: error.response?.data?.message || 'Request failed',
    };
  }
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/login',
      data: { email, password },
    });
  },

  register: async (userData: {
    email: string;
    username: string;
    password: string;
    dateOfBirth?: string;
  }) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/register',
      data: userData,
    });
  },

  logout: async () => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/logout',
    });
  },

  refreshToken: async () => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/refresh',
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      data: { email },
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      data: { token, password },
    });
  },

  verifyEmail: async (token: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/auth/verify-email',
      data: { token },
    });
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/auth/profile',
    });
  },

  updateProfile: async (userData: any) => {
    return apiRequest({
      method: 'PUT',
      url: '/api/v1/profile/update',
      data: userData,
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest({
      method: 'PUT',
      url: '/api/v1/profile/password',
      data: { currentPassword, newPassword },
    });
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await apiClient.post('/api/v1/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Upload failed',
        message: error.response?.data?.message || 'Profile picture upload failed',
      };
    }
  },

  deleteProfilePicture: async () => {
    return apiRequest({
      method: 'DELETE',
      url: '/api/v1/profile/picture',
    });
  },

  deleteAccount: async () => {
    return apiRequest({
      method: 'DELETE',
      url: '/api/v1/user/account',
    });
  },
};

// Mental Health API
export const mentalHealthApi = {
  getAssessments: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/mental-health/assessments',
    });
  },

  submitAssessment: async (assessmentData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/mental-health/assessments',
      data: assessmentData,
    });
  },

  getJournalEntries: async (page = 1, limit = 10) => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/mental-health/journal',
      params: { page, limit },
    });
  },

  createJournalEntry: async (entryData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/mental-health/journal',
      data: entryData,
    });
  },

  updateJournalEntry: async (id: string, entryData: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/v1/mental-health/journal/${id}`,
      data: entryData,
    });
  },

  deleteJournalEntry: async (id: string) => {
    return apiRequest({
      method: 'DELETE',
      url: `/api/v1/mental-health/journal/${id}`,
    });
  },

  getCommunityPosts: async (category?: string, page = 1, limit = 10) => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/mental-health/community',
      params: { category, page, limit },
    });
  },

  createCommunityPost: async (postData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/mental-health/community',
      data: postData,
    });
  },
};

// Financial Education API
export const financialApi = {
  getSimulations: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/financial/simulations',
    });
  },

  startSimulation: async (scenarioId: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/financial/simulations/start',
      data: { scenarioId },
    });
  },

  submitSimulationDecision: async (sessionId: string, decision: any) => {
    return apiRequest({
      method: 'POST',
      url: `/api/v1/financial/simulations/${sessionId}/decision`,
      data: decision,
    });
  },

  getLearningModules: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/financial/modules',
    });
  },

  getModuleProgress: async (moduleId: string) => {
    return apiRequest({
      method: 'GET',
      url: `/api/v1/financial/modules/${moduleId}/progress`,
    });
  },

  updateModuleProgress: async (moduleId: string, progress: any) => {
    return apiRequest({
      method: 'PUT',
      url: `/api/v1/financial/modules/${moduleId}/progress`,
      data: progress,
    });
  },
};

// Digital Wellness API
export const digitalWellnessApi = {
  getScreenTimeData: async (startDate?: string, endDate?: string) => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/digital-wellness/screen-time',
      params: { startDate, endDate },
    });
  },

  logScreenTime: async (screenTimeData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/digital-wellness/screen-time',
      data: screenTimeData,
    });
  },

  getDetoxChallenges: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/digital-wellness/detox-challenges',
    });
  },

  startDetoxChallenge: async (challengeType: string) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/digital-wellness/detox-challenges',
      data: { type: challengeType },
    });
  },

  checkInDetoxChallenge: async (challengeId: string, checkInData: any) => {
    return apiRequest({
      method: 'POST',
      url: `/api/v1/digital-wellness/detox-challenges/${challengeId}/checkin`,
      data: checkInData,
    });
  },
};

// Access & Inclusion API
export const accessInclusionApi = {
  getServiceLocations: async (type?: string, location?: string) => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/access-inclusion/services',
      params: { type, location },
    });
  },

  getOpportunities: async (type?: string, page = 1, limit = 10) => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/access-inclusion/opportunities',
      params: { type, page, limit },
    });
  },

  submitServiceReview: async (serviceId: string, reviewData: any) => {
    return apiRequest({
      method: 'POST',
      url: `/api/v1/access-inclusion/services/${serviceId}/reviews`,
      data: reviewData,
    });
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardData: async () => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/analytics/dashboard',
    });
  },

  getProgressInsights: async (timeframe = '30d') => {
    return apiRequest({
      method: 'GET',
      url: '/api/v1/analytics/insights',
      params: { timeframe },
    });
  },

  trackEvent: async (eventName: string, eventData: any) => {
    return apiRequest({
      method: 'POST',
      url: '/api/v1/analytics/events',
      data: { event: eventName, data: eventData },
    });
  },
};

// File upload utility
export const uploadFile = async (file: File, endpoint: string): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Upload failed',
      message: error.response?.data?.message || 'File upload failed',
    };
  }
};

export default apiClient;