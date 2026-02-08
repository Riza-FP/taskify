import { apiFetch } from "./client";

export type RegisterRequestDTO = {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export async function login(email: string, password: string) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // The backend returns { success: true, data: { user, session: { access_token } } }
  // We need to access data.data.session.access_token
  if (data.data?.session?.access_token) {
    localStorage.setItem("token", data.data.session.access_token);
  } else {
    console.error("Login failed: No access token received", data);
    throw new Error("No access token received");
  }

  return data;
}

export async function register(data: RegisterRequestDTO) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res;
}
