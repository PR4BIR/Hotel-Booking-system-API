import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Use environment variable if available, otherwise fallback to localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log('🌐 API URL:', baseURL); // For debugging

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Log request details for debugging
    console.log('🔍 Making request to:', config.url);
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.log('❌ No token found - request will be unauthenticated');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ Response received:', {
      url: response.config.url,
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
      data: response.config.url?.includes('/featured') ? response.data : 'Response data hidden for non-featured endpoints'
    });
    return response;
  },
  (error: AxiosError) => {
    // Log detailed error info for debugging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Get error message from response if available
    const errorMessage = 
      (error.response?.data as any)?.detail || 
      (error.response?.data as any)?.message || 
      'An error occurred while connecting to the server';
    
    // Special handling for rooms endpoints
    const isRoomsEndpoint = error.config?.url?.includes('/rooms');
    const isFeaturedRooms = error.config?.url?.includes('/rooms/featured');
    
    // Handle different error status codes
    switch (error.response?.status) {
      case 401: // Unauthorized
        console.log('🚪 401 Unauthorized - clearing auth data');
        
        // Don't show toast for login endpoint failures
        if (!error.config?.url?.includes('/auth/login')) {
          toast.error('Your session has expired. Please log in again.');
        }
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Remove Authorization header from future requests
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 Redirecting to login page');
          window.location.href = '/login';
        }
        break;
        
      case 403: // Forbidden
        toast.error('You do not have permission to perform this action');
        break;
        
      case 404: // Not found
        if (isRoomsEndpoint) {
          console.log('🏨 Rooms endpoint not found - might need to create sample data');
          if (isFeaturedRooms) {
            // Don't show error toast for featured rooms 404, handle gracefully
            console.log('🏠 Featured rooms endpoint not found, will show fallback');
          } else {
            toast.error('Rooms data not available');
          }
        } else if (!error.config?.url?.includes('/docs') && !error.config?.url?.includes('/openapi')) {
          toast.error('The requested resource was not found');
        }
        break;
        
      case 422: // Validation error
        if (isFeaturedRooms) {
          console.log('🏨 422 error on featured rooms - likely data serialization issue');
          // Don't show toast, handle gracefully in the component
        } else {
          toast.error(errorMessage || 'Please check your input and try again');
        }
        break;
        
      case 500: // Server error
      case 502: // Bad gateway
      case 503: // Service unavailable
        if (isRoomsEndpoint) {
          console.log('🏨 Server error on rooms endpoint');
          // Don't show toast for rooms server errors, handle gracefully
        } else {
          toast.error('Server error. Please try again later.');
        }
        break;
        
      default:
        // Show the error message for other status codes
        if (error.response?.status) {
          // Don't show toast for rooms endpoints, let components handle gracefully
          if (!isRoomsEndpoint) {
            toast.error(errorMessage);
          } else {
            console.log('🏨 Rooms endpoint error, handling gracefully:', errorMessage);
          }
        } else {
          // Network error or timeout
          if (!isRoomsEndpoint) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            console.log('🏨 Network error on rooms endpoint');
          }
        }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;