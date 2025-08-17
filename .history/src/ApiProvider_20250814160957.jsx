import React, { createContext, useContext } from "react";
import io from "socket.io-client";

// Use the correct environment variable for Create React App
const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const api = {
    getMenu: async () => {
      const response = await fetch(`${API_URL}/api/menu`);
      return response.json();
    },

    // --- FIX: This function was missing ---
    placeDeliveryOrder: async (orderData) => {
      const response = await fetch(`${API_URL}/api/delivery-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      return response.json();
    },

    getAllStreets: async () => {
      const response = await fetch(`${API_URL}/api/streets`, fetchOptions);
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
    deleteStreet: async (id) => {
      await fetch(`${API_URL}/api/streets/${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      return { success: true };
    },

    // We can add other functions here as needed for the static site
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
