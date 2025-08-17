import React, { useState, createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const location = useLocation(); // Get the current URL location

  useEffect(() => {
    // --- FIX ---
    // Only check for a login profile if the user is on a staff page.
    // This prevents unnecessary 401 errors on the customer-facing pages.
    if (location.pathname.startsWith("/staff")) {
      api
        .getProfile()
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // If we are not on a staff page, there's no need to check for a user.
      setLoading(false);
    }
  }, [api, location.pathname]);

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = { user, login, logout, loading };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
