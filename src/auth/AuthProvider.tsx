import { useState, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { UserRole } from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState<UserRole | null>(
    (localStorage.getItem("role") as UserRole | null)
  );

  const login = (newToken: string, newRole: UserRole) => {
    setToken(newToken);
    setRole(newRole);

    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};