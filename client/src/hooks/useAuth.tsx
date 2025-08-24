// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('fittype_token'));

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fittype_token');
      if (storedToken) {
        try {
          const response = await authAPI.getProfile(storedToken);
          if (response.success) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('fittype_token');
            setToken(null);
          }
        } catch (error) {
          // Token invalid or expired, clear it
          localStorage.removeItem('fittype_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(fullName, email, password);
      
      if (response.success) {
        const { user, token: authToken } = response.data;
        setUser(user);
        setToken(authToken);
        localStorage.setItem('fittype_token', authToken);
        return { user, error: null };
      }
    } catch (error) {
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.signin(email, password);
      
      if (response.success) {
        const { user, token: authToken } = response.data;
        setUser(user);
        setToken(authToken);
        localStorage.setItem('fittype_token', authToken);
        return { user, error: null };
      }
    } catch (error) {
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fittype_token');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(token, profileData);
      if (response.success) {
        setUser(response.data.user);
        return { user: response.data.user, error: null };
      }
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await authAPI.changePassword(token, currentPassword, newPassword, confirmPassword);
      return { success: response.success, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await authAPI.deleteAccount(token);
      if (response.success) {
        signOut(); // Clear user data
        return { success: true, error: null };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};