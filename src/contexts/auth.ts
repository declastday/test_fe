import { createContext } from "react";
import type { User } from "@/lib/api";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  login: (studentId: number, password: string) => Promise<void>;
  logout: () => void;
  handleSessionExpired: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
