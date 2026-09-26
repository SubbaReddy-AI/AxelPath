import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adminLogin,
  getAdminProfile,
} from "../api/adminApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem(
        "AxelPath_admin_token"
      );

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getAdminProfile();
        setUser(profile);
      } catch {
        localStorage.removeItem(
          "AxelPath_admin_token"
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const login = async (email, password) => {
    const data = await adminLogin(email, password);

    if (!data.access_token) {
      throw new Error("Login token was not returned.");
    }

    localStorage.setItem(
      "AxelPath_admin_token",
      data.access_token
    );

    setUser(data.user || (await getAdminProfile()));

    return data;
  };

  const logout = () => {
    localStorage.removeItem("AxelPath_admin_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}