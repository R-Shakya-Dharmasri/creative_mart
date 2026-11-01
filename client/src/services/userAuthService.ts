
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// Separate API client for user authentication
const userApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export interface SriVoraUser {
  id: string;
  name: string;
  email: string;
  role: "user";
  authProvider?: "local" | "google";
  createdAt?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: SriVoraUser;
}

interface RegisterResponse {
  message: string;
  user: SriVoraUser;
}

// Register a new user
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const response = await userApi.post<RegisterResponse>(
    "/users/register",
    { name, email, password }
  );

  return response.data;
}

// Login and save user JWT
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await userApi.post<AuthResponse>(
    "/users/login",
    { email, password }
  );

  sessionStorage.setItem(
    "srivora_user_token",
    response.data.token
  );

  return response.data;
}

// Get logged-in user profile
export async function getUserProfile(): Promise<SriVoraUser> {
  const token = sessionStorage.getItem(
    "srivora_user_token"
  );

  if (!token) {
    throw new Error("User is not logged in");
  }

  const response = await userApi.get<{
    user: SriVoraUser;
  }>("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user;
}

// Logout user
export function logoutUser(): void {
  sessionStorage.removeItem("srivora_user_token");
}

// Check whether a user token exists
export function hasUserToken(): boolean {
  return Boolean(
    sessionStorage.getItem("srivora_user_token")
  );
}
