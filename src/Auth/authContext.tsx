/* @refresh reset */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

export type Role = "admin" | "superadmin" | "user";

type User = {
  _id: string;
  email: string;
  role: Role;
  profileImage?: string;
  iat?: number;
  exp?: number;
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isSuper: () => boolean;
  isUser: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- helper to normalize any JWT payload shape
function normalize(decoded: any): User {
  const role = (decoded?.role || "").toString().toLowerCase();
  const _id = decoded?._id || decoded?.id || "";
  return {
    _id,
    email: decoded?.email || "",
    role: (role as Role) || "user",
    iat: decoded?.iat,
    exp: decoded?.exp,
    profileImage: decoded?.profileImage,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const raw = jwtDecode<any>(token);
      return normalize(raw);
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  });

  useEffect(() => {
    let timer: number | null = null;
    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        logout();
        alert("You have been logged out due to inactivity.");
      }, 240_000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    window.addEventListener("scroll", reset);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("click", reset);
      window.removeEventListener("scroll", reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const raw = jwtDecode<any>(token);
    const norm = normalize(raw);
    setUser(norm);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = () => user !== null;

  const helpers = useMemo(
    () => ({
      isAdmin: () => user?.role === "admin",
      isSuper: () => user?.role === "superadmin",
      isUser: () => user?.role === "user",
    }),
    [user]
  );

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    ...helpers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
