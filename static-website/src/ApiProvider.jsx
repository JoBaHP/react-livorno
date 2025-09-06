import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { withCredentials: true });

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const api = {
    getMenu: async () => {
      const response = await fetch(`${API_URL}/api/menu`);
      return response.json();
    },

    getAllStreets: async (fetchAll = false) => {
      const url = fetchAll
        ? `${API_URL}/api/streets?all=true`
        : `${API_URL}/api/streets`;
      const response = await fetch(url);
      return response.json();
    },

    searchStreets: async (term) => {
      if (!term || term.length < 2) return [];
      const response = await fetch(
        `${API_URL}/api/streets/search?term=${encodeURIComponent(term)}`
      );
      return response.json();
    },

    placeDeliveryOrder: async (orderData) => {
      const response = await fetch(`${API_URL}/api/delivery-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
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
