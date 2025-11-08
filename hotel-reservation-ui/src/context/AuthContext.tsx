import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../types';
import * as api from '../api/endpoints';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client'; // Import the API client

// Define the context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; username: string }) => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Initialize auth state on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔄 Initializing auth state...');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('User data:', userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.id) {
          // Set the default header for all future requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(parsedUser);
          console.log('✅ Auth state restored for user:', parsedUser.email);
        }
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔑 Attempting login for:', email);
      
      // Call the login API function
      const response = await api.login(email, password);
      console.log('✅ Login response received:', response);
      
      // Extract token and user from response
      const { access_token, user: userData } = response as any;
      const token = access_token;
      
      if (!token) {
        throw new Error('No access token received from server');
      }
      
      console.log('💾 Storing token and user data...');
      console.log('Token preview:', token.substring(0, 20) + '...');
      console.log('User data:', userData);
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default authorization header for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header set');
      
      setUser(userData);
      
      // Show welcome toast message with user's name
      toast.success(
        <div className="welcome-toast">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Welcome back, {userData.username}!</span>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
      
      // Show welcome popup
      setShowWelcomePopup(true);
      
      // Auto hide popup after 6 seconds
      setTimeout(() => {
        setShowWelcomePopup(false);
      }, 6000);
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials and try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const username = user?.username; // Store username before clearing user
    
    console.log('🚪 Logging out user:', username);
    
    // Clear token from API client
    delete apiClient.defaults.headers.common['Authorization'];
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Show goodbye message
    if (username) {
      toast.info(
        <div className="goodbye-toast">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <span>Goodbye, {username}! You've been logged out.</span>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
    
    navigate('/login');
  };

  const register = async (userData: { email: string; password: string; username: string }) => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      await api.register(userData);
      
      // Show welcome toast message for new registration
      toast.success(
        <div className="register-toast">
          <div className="flex flex-col">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Welcome to Luxury Hotel, {userData.username}!</span>
            </div>
            <p className="mt-1 text-sm ml-7">Your account has been created successfully.</p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed. Please try again with different credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
      
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && user && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md mx-4 welcome-popup-card overflow-hidden"
            >
              {/* Luxury hotel image at the top */}
              <div className="h-40 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}
              >
                <div className="h-full w-full bg-gradient-to-b from-blue-900/40 to-blue-900/80 flex items-end p-6">
                  <h3 className="text-xl text-white font-light">Luxury Hotel</h3>
                </div>
              </div>
              
              <div className="bg-white p-6 text-center">
                <div className="welcome-avatar mb-4 mx-auto">
                  <div className="welcome-avatar-inner">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome back, {user.username}!</h2>
                <p className="text-gray-600 mb-6">We're delighted to see you again at Luxury Hotel.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setShowWelcomePopup(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    to="/reservations/new" 
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-colors duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setShowWelcomePopup(false)}
                  >
                    Book a Room
                  </Link>
                </div>
                
                <button 
                  onClick={() => setShowWelcomePopup(false)}
                  className="absolute top-2 right-2 text-white hover:text-gray-200 bg-black/30 hover:bg-black/40 p-1 rounded-full transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Interactive map loading... message */}
              <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm text-gray-600">Interactive map loading...</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};