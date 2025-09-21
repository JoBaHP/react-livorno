import React, { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "./ApiProvider";
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser, setLoading } from './store/authSlice';
import { selectAuthUser, selectAuthLoading } from './store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const api = useApi();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    if (!location.pathname.startsWith("/staff")) {
      dispatch(setLoading(false));
      return;
    }
    let mounted = true;
    dispatch(setLoading(true));
    const load = async () => {
      try {
        const data = await api.getProfile();
        if (!mounted) return;
        if (data && data.user) {
          dispatch(setUser(data.user));
          return;
        }
        throw new Error('No user');
      } catch (err) {
        if (!mounted) return;
        try {
          const refresh = await api.refreshSession();
          if (refresh && refresh.user) {
            dispatch(setUser(refresh.user));
          } else {
            dispatch(clearUser());
          }
        } catch (refreshErr) {
          dispatch(clearUser());
        }
      } finally {
        if (mounted) dispatch(setLoading(false));
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api, location.pathname, dispatch]);

  useEffect(() => {
    if (!user || !location.pathname.startsWith('/staff')) return undefined;
    let cancelled = false;

    const refresh = () => {
      api
        .refreshSession()
        .then((data) => {
          if (cancelled) return;
          if (data && data.user) {
            dispatch(setUser(data.user));
          }
        })
        .catch(() => {
          if (!cancelled) {
            dispatch(clearUser());
          }
        });
    };

    const interval = setInterval(refresh, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [api, dispatch, location.pathname, user]);

  const login = async (username, password) => {
    const result = await api.login(username, password);
    if (result.user) dispatch(setUser(result.user));
    return result;
  };

  const logout = async () => {
    await api.logout();
    dispatch(clearUser());
  };

  const value = { user, login, logout, loading };

  // The ProtectedRoute will now correctly use the 'loading' state.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
