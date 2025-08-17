import React, { useState, createContext, useContext, useEffect } from "react";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To prevent UI flicker on load
  const api = useApi();

  useEffect(() => {
    // On app start, check if the user is already logged in via the secure cookie
    api
      .getProfile()
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // If the profile check fails (e.g., 401 error), ensure user is null
        setUser(null);
      })
      .finally(() => {
        setLoading(false); // Stop loading once the check is complete
      });
  }, [api]);

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

  // Display a loading indicator while we check the user's login status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useApi = () => useContext(AuthContext);
