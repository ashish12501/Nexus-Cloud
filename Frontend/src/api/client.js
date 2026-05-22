import axios from "axios";
import { store } from "../store/store.js";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log(import.meta.env.VITE_BACKEND_API);
// The Interceptor: Runs automatically before every request
apiClient.interceptors.request.use(
  (config) => {
    // Reach straight into Redux memory to grab the token
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
