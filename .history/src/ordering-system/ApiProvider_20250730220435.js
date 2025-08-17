import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

// Helper function to get the auth token from sessionStorage
const getAuthHeader = () => {
  try {
    const token = sessionStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error("Could not access sessionStorage for auth header:", error);
    return {};
  }
};

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const api = {
    getMenu: async () => {
      const response = await fetch(`${API_URL}/api/menu`);
      return response.json();
    },
    addMenuItem: async (item) => {
      const response = await fetch(`${API_URL}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    updateMenuItem: async (item) => {
      const response = await fetch(`${API_URL}/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    deleteMenuItem: async (itemId) => {
      await fetch(`${API_URL}/api/menu/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      return { success: true };
    },
    getTables: async () => {
      const response = await fetch(`${API_URL}/api/tables`);
      return response.json();
    },
    getOrders: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/api/orders?${query}`, {
        headers: getAuthHeader(),
      });
      return response.json();
    },
    placeOrder: async (cart, tableId) => {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, tableId }),
      });
      return response.json();
    },
    updateOrderStatus: async (orderId, status, waitTime = null) => {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status, waitTime }),
      });
      return response.json();
    },
    login: async (username, password) => {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    },
    submitFeedback: async (orderId, rating, comment) => {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        }
      );
      return response.json();
    },
    saveSubscription: async (subscription) => {
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ subscription }),
      });
      return response.json();
    },
    socket: {
      on: (eventName, callback) => socket.on(eventName, callback),
      off: (eventName, callback) => socket.off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
