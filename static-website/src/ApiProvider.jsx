import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";
const withCreds = (opts = {}) => ({ credentials: 'include', ...opts });
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_URL, { withCredentials: true });
  }
  return socketInstance;
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
      const response = await fetch(url, withCreds());
      return response.json();
    },

    getMenuCategories: async () => {
      const response = await fetch(`${API_URL}/api/menu/categories`, withCreds());
      return response.json();
    },

    getAllStreets: async (fetchAll = false) => {
      const url = fetchAll
        ? `${API_URL}/api/streets?all=true`
        : `${API_URL}/api/streets`;
      const response = await fetch(url, withCreds());
      return response.json();
    },

    searchStreets: async (term) => {
      if (!term || term.length < 2) return [];
      const response = await fetch(
        `${API_URL}/api/streets/search?term=${encodeURIComponent(term)}`,
        withCreds()
      );
      return response.json();
    },

    placeDeliveryOrder: async (orderData) => {
      const response = await fetch(`${API_URL}/api/delivery-order`, withCreds({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      }));
      return response.json();
    },

    // Auth endpoints
    getProfile: async () => {
      const response = await fetch(`${API_URL}/api/profile`, withCreds());
      return response.json();
    },
    refreshSession: async () => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, withCreds({ method: 'POST' }));
      if (!response.ok) {
        throw new Error('Unable to refresh session');
      }
      return response.json();
    },
    logout: async () => {
      await fetch(`${API_URL}/api/logout`, withCreds({ method: 'POST' }));
      return { success: true };
    },

    // User orders
    getUserOrders: async () => {
      const response = await fetch(`${API_URL}/api/user/orders`, withCreds());
      return response.json();
    },
    repriceOrder: async (items) => {
      const response = await fetch(`${API_URL}/api/orders/reprice`, withCreds({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }));
      return response.json();
    },
    submitFeedback: async (orderId, rating, comment) => {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/feedback`, withCreds({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      }));
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to submit feedback');
      }
      return response.json();
    },

    socket: {
      on: (eventName, callback) => getSocket().on(eventName, callback),
      off: (eventName, callback) => getSocket().off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
