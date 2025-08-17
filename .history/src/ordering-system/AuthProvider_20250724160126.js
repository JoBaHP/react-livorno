import React, { useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "./ApiProvider";

const AuthContext = createContext();

const getInitialState = () => {
  try {
    // Attempt to get the token from sessionStorage
    const token = sessionStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        sessionStorage.removeItem("authToken");
        return { token: null, user: null };
      }
      return { token, user: { id: decoded.id, role: decoded.role } };
    }
  } catch (error) {
    console.error("Could not access sessionStorage or decode token:", error);
  }
  // Default to logged out state if storage is blocked or token is invalid
  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialState().token);
  const [user, setUser] = useState(getInitialState().user);
  const api = useApi();

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.token && result.user) {
      try {
        // Save token to sessionStorage on login
        sessionStorage.setItem("authToken", result.token);
      } catch (error) {
        console.error("Could not set authToken in sessionStorage:", error);
      }
      setToken(result.token);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    try {
      // Remove token from sessionStorage on logout
      sessionStorage.removeItem("authToken");
    } catch (error) {
      console.error("Could not remove authToken from sessionStorage:", error);
    }
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
