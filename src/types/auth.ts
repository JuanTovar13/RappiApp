export type UserRole = "consumer" | "store" | "delivery";

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}