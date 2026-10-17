
import api from "./api";

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    email: string;
  };
}

export interface AdminVerifyResponse {
  authenticated: boolean;
  role: string;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminLoginResponse> {
  const { data } = await api.post<AdminLoginResponse>(
    "/admin/login",
    {
      email,
      password,
    }
  );

  return data;
}

export async function verifyAdmin(
  token: string
): Promise<AdminVerifyResponse> {
  const { data } = await api.get<AdminVerifyResponse>(
    "/admin/verify",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem("srivora_admin_token");
}
