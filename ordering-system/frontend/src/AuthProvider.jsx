import React, { useState, createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const location = useLocation();

  useEffect(() => {
    // Only check for a login profile if the user is on a staff page.
    if (location.pathname.startsWith("/staff")) {
      api
        .getProfile()
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          // If the profile check fails (e.g., 401 error), ensure user is null.
          setUser(null);
        })
        .finally(() => {
          // --- FIX ---
          // This is the crucial change. We ensure that loading is always
          // set to false, even if the API call fails.
          setLoading(false);
        });
    } else {
      // If we are not on a staff page, stop loading immediately.
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

  // The ProtectedRoute will now correctly use the 'loading' state.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
