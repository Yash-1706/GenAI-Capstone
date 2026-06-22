import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

