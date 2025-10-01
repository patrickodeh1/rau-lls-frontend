// src/services/auth.ts
import api from "./api"; // Import the Axios instance

export interface LoginResponse {
  refresh: string;
  access: string;
  role: string;
  user_id: string;
  name: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post("/login/", { email, password }); // Use Axios instead of fetch

  const data: LoginResponse = response.data;

  // Store tokens and user details
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("role", data.role);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("name", data.name);

  return data;
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("name");
};

export const getAccessToken = () => localStorage.getItem("access");

export const isAuthenticated = () => !!getAccessToken();