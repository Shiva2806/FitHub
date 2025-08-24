// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new APIError(
      data.message || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data;
};

export const authAPI = {
  // Register new user
  signup: async (fullName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });
    
    return handleResponse(response);
  },

  // Login user
  signin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return handleResponse(response);
  },

  // Get user profile
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    return handleResponse(response);
  },

  // Change password
  changePassword: async (token, currentPassword, newPassword, confirmPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    
    return handleResponse(response);
  },

  // Delete account
  deleteAccount: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  }
};