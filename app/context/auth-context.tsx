"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { account } from "@/lib/appwrite";
import { useRouter, usePathname } from "next/navigation";
import { Models } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUserStatus();
  }, []);

  async function checkUserStatus() {
    try {
      const sessionUser = await account.get();
      setUser(sessionUser);

      // Redirect if on landing page and session exists
      if (pathname === "/") {
        router.push("/dashboard");
      }
    } catch (error) {
      setUser(null);
      // Redirect to landing if trying to access protected routes
      if (pathname.startsWith("/dashboard")) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
