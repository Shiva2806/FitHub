// src/services/api.js

// ✅ CORRECTED to use the variable name from your Vercel settings
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

console.log("🌐 API Base URL ->", API_BASE_URL); // Debug log to confirm which backend is used

// Custom API Error class
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new APIError(data.message || "An error occurred", response.status, data);
  }

  return data;
};

// Authentication API methods
export const authAPI = {
  // Register new user
  signup: async (fullName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, { // Added /api prefix
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    return handleResponse(response);
  },

  // Login user
  signin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, { // Added /api prefix
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
  },

  // Get user profile
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, { // Added /api prefix
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  },

  // ... (the rest of the file is the same)
  // Update user profile
  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    return handleResponse(response);
  },

  // Change password
  changePassword: async (token, currentPassword, newPassword, confirmPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    return handleResponse(response);
  },

  // Delete account
  deleteAccount: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  },
};