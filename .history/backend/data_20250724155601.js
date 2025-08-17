import React, { useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state without localStorage, as it's blocked.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const api = useApi();

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.token && result.user) {
      setToken(result.token);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
