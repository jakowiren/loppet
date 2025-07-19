import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      Cookies.remove('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  googleLogin: async (token: string, userData?: {
    username?: string;
    skills?: string[];
    githubUsername?: string;
  }) => {
    const response = await api.post('/auth/google', {
      token,
      ...userData
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.post('/auth/verify');
    return response.data;
  }
};

// Project API
export const projectApi = {
  getProjects: async (params?: {
    query?: string;
    category?: string;
    techStack?: string[];
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: {
    title: string;
    description: string;
    githubUrl?: string;
    techStack: string[];
    category: string;
    impactDescription: string;
  }) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  joinProject: async (id: string) => {
    const response = await api.post(`/projects/${id}/join`);
    return response.data;
  },

  leaveProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}/leave`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/projects/meta/categories');
    return response.data;
  }
};

// User API
export const userApi = {
  getUserProfile: async (username: string) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (profileData: {
    displayName?: string;
    skills?: string[];
    githubUsername?: string;
  }) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get('/users/dashboard/data');
    return response.data;
  }
};

// Admin API
export const adminApi = {
  getPendingProjects: async () => {
    const response = await api.get('/admin/projects/pending');
    return response.data;
  },

  reviewProject: async (id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    const response = await api.post(`/admin/projects/${id}/review`, {
      status,
      rejectionReason
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAllProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/admin/projects/all', { params });
    return response.data;
  }
};

export default api;