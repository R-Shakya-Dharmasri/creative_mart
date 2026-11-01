
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  timeout: 10000,
});

// Automatically attach admin JWT token to API requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(
      "srivora_admin_token"
    );

    if (token) {
      config.headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
