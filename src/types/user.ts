import { UserRole } from "./auth";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}