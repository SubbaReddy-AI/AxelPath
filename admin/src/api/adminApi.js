import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://qodekraft.onrender.com/api/v1";

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add admin JWT token to every request
adminApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("AxelPath_admin_token") ||
      localStorage.getItem("admin_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized requests
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("AxelPath_admin_token");
      localStorage.removeItem("admin_token");
    }

    return Promise.reject(error);
  }
);

// Admin login
export const adminLogin = async (email, password) => {
  const response = await adminApi.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// Get list
export const getAdminList = async (endpoint) => {
  const response = await adminApi.get(endpoint);
  return response.data;
};

// Get single item
export const getAdminItem = async (endpoint) => {
  const response = await adminApi.get(endpoint);
  return response.data;
};

// Create item
export const createAdminItem = async (endpoint, data) => {
  const response = await adminApi.post(endpoint, data);
  return response.data;
};

// Update item
export const updateAdminItem = async (endpoint, data) => {
  const response = await adminApi.put(endpoint, data);
  return response.data;
};

// Delete item
export const deleteAdminItem = async (endpoint) => {
  const response = await adminApi.delete(endpoint);
  return response.data;
};

export default adminApi;