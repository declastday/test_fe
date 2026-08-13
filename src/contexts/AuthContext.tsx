import { useState, useCallback, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { AuthContext } from "./auth";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session) {
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("refresh_token", data.session.refresh_token);
          setUser(getStoredUser());
        } else {
          api.clearTokens();
        }
      } else {
        setUser(getStoredUser());
      }
      setIsLoading(false);
    };

    void initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          localStorage.setItem("access_token", session.access_token);
          localStorage.setItem("refresh_token", session.refresh_token);
        } else if (event === "SIGNED_OUT") {
          api.clearTokens();
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (studentId: number, password: string) => {
    const response = await api.login(studentId, password);
    if (response.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });
      if (error) throw error;
    }
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
    api.logout();
    setUser(null);
  }, []);

  const handleSessionExpired = useCallback(() => {
    api.clearTokens();
    setUser(null);
    setIsSessionExpired(true);
  }, []);

  const handleSessionExpiredConfirm = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        isSessionExpired,
        login,
        logout,
        handleSessionExpired,
      }}
    >
      {children}
      <SessionExpiredDialog
        open={isSessionExpired}
        onConfirm={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
}
