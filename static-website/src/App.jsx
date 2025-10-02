import React, { Suspense, useEffect, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";
import { ApiProvider } from "./ApiProvider";
import ScrollToHash from "./ScrollToHash";
import "./App.css";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setUser, clearUser, setLoading } from './store/authSlice';
import { useApi } from './ApiProvider';

ReactGA.initialize("G-EVKLDJZFZE");
const queryClient = new QueryClient();
const HomePage = lazy(() => import("./pages/HomePage"));
const OnlineOrderingPage = lazy(() => import("./pages/OnlineOrderingPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

function AuthBootstrap() {
  const api = useApi();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useRegisterSW({ immediate: true });

  useEffect(() => {
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
  }, [api, dispatch]);

  useEffect(() => {
    if (!user) return undefined;
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
  }, [api, dispatch, user]);

  return null;
}

const App = () => {
  return (
    <ApiProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap />
          <ScrollToHash />
          <Suspense
            fallback={
              <div
                className="p__cormorant"
                style={{
                  padding: "4rem 1rem",
                  textAlign: "center",
                  color: "var(--color-golden)",
                }}
              >
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/delivery" element={<OnlineOrderingPage />} />
              <Route
                path="/delivery/status"
                element={<OnlineOrderingPage initialView="status" />}
              />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
          </Suspense>
        </QueryClientProvider>
      </Provider>
    </ApiProvider>
  );
};

export default App;
