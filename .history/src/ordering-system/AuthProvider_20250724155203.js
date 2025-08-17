import React, { useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

const getInitialState = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("authToken");
        return { token: null, user: null };
      }
      return { token, user: { id: decoded.id, role: decoded.role } };
    }
  } catch (error) {
    console.error("Could not access localStorage or decode token:", error);
    // If localStorage is blocked or token is bad, proceed as logged out.
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
      try {
        localStorage.setItem("authToken", result.token);
      } catch (error) {
        console.error("Could not set authToken in localStorage:", error);
      }
      setToken(result.token);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    try {
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Could not remove authToken from localStorage:", error);
    }
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
