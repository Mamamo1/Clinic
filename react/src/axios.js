import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const noAuthRoutes = ['/signup', '/login'];

axiosClient.interceptors.request.use((config) => {
  if (noAuthRoutes.includes(config.url)) {
    return config;
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error("Error response:", error.response);
      if (error.response.status === 401) {
        window.location.href = '/login';
      }
    }
    throw error;
  }
);

export default axiosClient;
