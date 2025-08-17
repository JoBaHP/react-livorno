import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { withCredentials: true });

const fetchOptions = {
  credentials: "include", // This tells fetch to send cookies with every request
};

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const api = {
    getMenu: async () => {
      const response = await fetch(`${API_URL}/api/menu`, fetchOptions);
      return response.json();
    },
    addMenuItem: async (item) => {
      const response = await fetch(`${API_URL}/api/menu`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    updateMenuItem: async (item) => {
      const response = await fetch(`${API_URL}/api/menu/${item.id}`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    deleteMenuItem: async (itemId) => {
      await fetch(`${API_URL}/api/menu/${itemId}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },
    getTables: async () => {
      const response = await fetch(`${API_URL}/api/tables`, fetchOptions);
      return response.json();
    },
    getOrders: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_URL}/api/orders?${query}`,
        fetchOptions
      );
      return response.json();
    },
    placeOrder: async (cart, tableId, notes, paymentMethod) => {
      const response = await fetch(`${API_URL}/api/orders`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, tableId, notes, paymentMethod }),
      });
      return response.json();
    },
    updateOrderStatus: async (orderId, status, waitTime = null) => {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, waitTime }),
      });
      return response.json();
    },
    login: async (username, password) => {
      const response = await fetch(`${API_URL}/api/login`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    },
    logout: async () => {
      await fetch(`${API_URL}/api/logout`, { ...fetchOptions, method: "POST" });
    },
    getProfile: async () => {
      const response = await fetch(`${API_URL}/api/profile`, fetchOptions);
      return response.json();
    },
    saveSubscription: async (subscription) => {
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
      return response.json();
    },
    submitFeedback: async (orderId, rating, comment) => {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/feedback`,
        {
          ...fetchOptions,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        }
      );
      return response.json();
    },
    getAllOptions: async () => {
      const response = await fetch(`${API_URL}/api/options`, fetchOptions);
      return response.json();
    },
    createOption: async (name, price) => {
      const response = await fetch(`${API_URL}/api/options`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      return response.json();
    },
    updateOption: async (id, name, price) => {
      const response = await fetch(`${API_URL}/api/options/${id}`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      return response.json();
    },
    deleteOption: async (id) => {
      await fetch(`${API_URL}/api/options/${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },
    socket: {
      on: (eventName, callback) => socket.on(eventName, callback),
      off: (eventName, callback) => socket.off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
