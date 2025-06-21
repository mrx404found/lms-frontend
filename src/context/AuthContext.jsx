import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    mobile_no: ""
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token) {
      setUser({ token, refreshToken });
    }
    setLoading(false);
  }, []);

  // Add request interceptor
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(import.meta.env.VITE_API_TOKEN_REFRESH_URL, {
              refresh: refreshToken
            });

            const { access: token } = response.data;
            localStorage.setItem('token', token);
            setUser(prev => ({ ...prev, token }));

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username }); // Debug log
      
      const response = await api.post('/token/', {
        username,
        password
      });
      console.log('Login response:', response.data); // Debug log

      if (response.data.access && response.data.refresh) {
        const { access: token, refresh: refreshToken } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        setUser({ token, refreshToken });
        return true;
      } else {
        console.error('No access token in response:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: JSON.stringify({ username, password })
      });
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/token/refresh/', {
        refresh: refreshToken
      });

      if (response.data.access) {
        const token = response.data.access;
        localStorage.setItem('token', token);
        setUser(prev => ({ ...prev, token }));
        return token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const signupData = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        mobile_no: userData.mobile_no,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password2: userData.confirmPassword
      };

      const response = await api.post('/users/', signupData);
      console.log('Signup :', response.data);

      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({ token: response.data.token });
      }

      return response.data;
    } catch (error) {
      console.error('Signup error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: JSON.stringify(userData)
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    refreshAccessToken,
    loading,
    api // Export the configured axios instance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 