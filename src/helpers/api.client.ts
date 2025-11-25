import axios from "axios";
import { getLocalStorageItem, removeLocalStorageItem } from "./storage.helper";

export const API_BASE_URL = "http://98.89.104.110:8081/api/v1/";
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "/");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const resolveApiUrl = (path: string): string => {
  if (!path) {
    return "";
  }

  try {
    const url = new URL(path);
    return url.toString();
  } catch {
    return new URL(path, API_ROOT_URL).toString();
  }
};

// Request interceptor to add the token
apiClient.interceptors.request.use(
  (config) => {
    const token = getLocalStorageItem<string>("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Auto logout if token is invalid or expired
      removeLocalStorageItem("token");
      removeLocalStorageItem("currentUser");
      // We might want to trigger a redirect here or let the UI handle the error
      // For now, we just clear storage so the next reload/action reflects logged out state
    }
    return Promise.reject(error);
  }
);
