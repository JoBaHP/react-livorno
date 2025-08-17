import React, { useState, createContext, useContext } from "react";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const api = useApi();

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
