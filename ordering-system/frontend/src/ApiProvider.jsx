import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL, { withCredentials: true });

// This object ensures that cookies are sent with every API request.
const fetchOptions = {
  credentials: "include",
};

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const api = {
    getMenu: async (params = {}) => {
      const query = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value === undefined || value === null) return acc;
          acc[key] = value;
          return acc;
        }, {})
      ).toString();
      const url = query ? `${API_URL}/api/menu?${query}` : `${API_URL}/api/menu`;
      const response = await fetch(url, fetchOptions);
      return response.json();
    },
    reorderCategories: async (order) => {
      const response = await fetch(`${API_URL}/api/menu/categories/order`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!response.ok) {
        throw new Error('Failed to reorder categories');
      }
      return response.json();
    },
    getMenuCategories: async () => {
      const response = await fetch(`${API_URL}/api/menu/categories`, fetchOptions);
      return response.json();
    },
    updateCategoryParents: async (assignments) => {
      const response = await fetch(`${API_URL}/api/menu/categories/parents`, {
        ...fetchOptions,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });
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
    refreshSession: async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        ...fetchOptions,
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Unable to refresh session');
      }
      return response.json();
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
    getAllUsers: async () => {
      const response = await fetch(`${API_URL}/api/users`, fetchOptions);
      return response.json();
    },
    createUser: async (username, password, role) => {
      const response = await fetch(`${API_URL}/api/users`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      return response.json();
    },
    updateUserPassword: async (userId, password) => {
      const response = await fetch(`${API_URL}/api/users/${userId}/password`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      return response.json();
    },
    deleteUser: async (userId) => {
      await fetch(`${API_URL}/api/users/${userId}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },
    getSalesReport: async (date) => {
      const response = await fetch(
        `${API_URL}/api/reports/sales?date=${date}`,
        fetchOptions
      );
      return response.json();
    },
    getMonthlySalesReport: async (month) => {
      const response = await fetch(
        `${API_URL}/api/reports/monthly-sales?month=${month}`,
        fetchOptions
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
    getAllZones: async () => {
      const response = await fetch(`${API_URL}/api/zones`, fetchOptions);
      return response.json();
    },
    createZone: async (zoneData) => {
      const response = await fetch(`${API_URL}/api/zones`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zoneData),
      });
      return response.json();
    },
    updateZone: async (id, zoneData) => {
      const response = await fetch(`${API_URL}/api/zones/${id}`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zoneData),
      });
      return response.json();
    },
    deleteZone: async (id) => {
      await fetch(`${API_URL}/api/zones/${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },
    getAllStreets: async (page = 1) => {
      const response = await fetch(
        `${API_URL}/api/streets?page=${page}`,
        fetchOptions
      );
      return response.json();
    },
    createStreet: async (name) => {
      const response = await fetch(`${API_URL}/api/streets`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return response.json();
    },
    deleteStreet: async (id) => {
      await fetch(`${API_URL}/api/streets/${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },
    populateStreets: async (city) => {
      const response = await fetch(`${API_URL}/api/streets/populate`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      const data = await response.json();
      // If the response is not OK, throw an error with the backend's message
      if (!response.ok) {
        throw new Error(data.message || "Failed to populate streets");
      }
      return data;
    },
    socket: {
      on: (eventName, callback) => socket.on(eventName, callback),
      off: (eventName, callback) => socket.off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
