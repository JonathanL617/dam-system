import axios from "axios";

const api = axios.create({
    baseURL: ProcessingInstruction.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

export const uploadAsset = (formData) => api.post("/assets/upload", formData);
export const getAssets = () => api.get("/assets");
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

export const updateMetadata = (id, data) => api.put(`/assets/${id}/metadata`, data);
export const searchAssets = (query) => api.get(`/assets/search?q=${query}`);

