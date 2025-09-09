import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_URL, { withCredentials: true });
  }
  return socketInstance;
};

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  // --- Simple cache with localStorage persistence ---
  const [menuCache, setMenuCache] = useState(() => {
    try {
      const raw = localStorage.getItem("menuCacheV1");
      return raw ? JSON.parse(raw) : { data: null, ts: 0 };
    } catch (_) {
      return { data: null, ts: 0 };
    }
  });
  const inflight = useRef(null);

  const saveMenuCache = (data) => {
    const next = { data, ts: Date.now() };
    setMenuCache(next);
    try { localStorage.setItem("menuCacheV1", JSON.stringify(next)); } catch (_) {}
  };

  const TTL_MS = 15 * 60 * 1000; // 15 minutes

  // Prefetch ASAP on app load
  useEffect(() => {
    const fresh = menuCache?.data && Date.now() - (menuCache.ts || 0) < TTL_MS;
    if (fresh) return;
    // de-duplicate concurrent prefetch
    if (!inflight.current) {
      inflight.current = fetch(`${API_URL}/api/menu`)
        .then((r) => r.json())
        .then((data) => saveMenuCache(data))
        .catch(() => {})
        .finally(() => { inflight.current = null; });
    }
  }, []); // run once on mount

  const api = {
    // Returns cached menu if fresh; otherwise fetches and updates cache
    getMenu: async () => {
      const fresh = menuCache?.data && Date.now() - (menuCache.ts || 0) < TTL_MS;
      if (fresh) return menuCache.data;
      if (!inflight.current) {
        inflight.current = fetch(`${API_URL}/api/menu`)
          .then((r) => r.json())
          .then((data) => { saveMenuCache(data); return data; })
          .finally(() => { inflight.current = null; });
      }
      try { return await inflight.current; } catch { return menuCache.data || []; }
    },
    invalidateMenuCache: () => {
      setMenuCache({ data: null, ts: 0 });
      try { localStorage.removeItem("menuCacheV1"); } catch (_) {}
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
      on: (eventName, callback) => getSocket().on(eventName, callback),
      off: (eventName, callback) => getSocket().off(eventName, callback),
    },
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
