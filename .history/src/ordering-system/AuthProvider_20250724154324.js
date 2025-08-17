import React, { useState, createContext, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

const getInitialState = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("authToken");
        return { token: null, user: null };
      }
      return { token, user: { id: decoded.id, role: decoded.role } };
    } catch (error) {
      localStorage.removeItem("authToken");
      return { token: null, user: null };
    }
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialState().token);
  const [user, setUser] = useState(getInitialState().user);
  const api = useApi();

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.token) {
      localStorage.setItem("authToken", result.token);
      setToken(result.token);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
