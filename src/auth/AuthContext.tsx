import { createContext } from "react";
import  {UserRole}  from "../types/auth";

export interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  login: () => {},
  logout: () => {},
});