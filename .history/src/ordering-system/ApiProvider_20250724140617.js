import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = "http://localhost:3001";
const socket = io(API_URL);

socket.on("connect", () => {
  console.log("React app connected to Socket.IO server with ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("React app disconnected from Socket.IO server.");
});

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    updateMenuItem: async (item) => {
      const response = await fetch(`${API_URL}/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return response.json();
    },
    deleteMenuItem: async (itemId) => {
      await fetch(`${API_URL}/api/menu/${itemId}`, { method: "DELETE" });
      return { success: true };
    },
    getTables: async () => {
      const response = await fetch(`${API_URL}/api/tables`);
      return response.json();
    },
    getOrders: async () => {
      const response = await fetch(`${API_URL}/api/orders`);
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
        headers: { "Content-Type": "application/json" },
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
    socket: {
      on: (eventName, callback) => socket.on(eventName, callback),
      off: (eventName, callback) => socket.off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
