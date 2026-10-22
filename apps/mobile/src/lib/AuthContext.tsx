import React, { createContext, useContext, useState, useEffect } from "react";
import safeStorage from "./storage";
import { apiFetch } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {
    throw new Error("Not implemented");
  },
  register: async () => {
    throw new Error("Not implemented");
  },
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await safeStorage.getItem("customer_token");
        const storedUser = await safeStorage.getItem("customer_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to restore auth session", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.data?.token || !res.data?.user) {
      throw new Error(res.message || "Invalid login response");
    }

    const authUser = res.data.user;
    const authToken = res.data.token;

    await safeStorage.setItem("customer_token", authToken);
    await safeStorage.setItem("customer_user", JSON.stringify(authUser));

    setToken(authToken);
    setUser(authUser);
    return authUser;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.data?.token || !res.data?.user) {
      throw new Error(res.message || "Invalid registration response");
    }

    const authUser = res.data.user;
    const authToken = res.data.token;

    await safeStorage.setItem("customer_token", authToken);
    await safeStorage.setItem("customer_user", JSON.stringify(authUser));

    setToken(authToken);
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    try {
      await safeStorage.removeItem("customer_token");
      await safeStorage.removeItem("customer_user");
    } catch (e) {
      console.error("Failed to clear auth storage", e);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
