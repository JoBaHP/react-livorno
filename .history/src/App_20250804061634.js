import React from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./HomePage";
import OrderingSystem from "./OrderingSystem";
import StaffLayout from "./ordering-system/StaffLayout";
import LoginView from "./ordering-system/views/LoginView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
import ProtectedRoute from "./ordering-system/ProtectedRoute"; // Import the new component
import { ApiProvider } from "./ordering-system/ApiProvider";
import { AuthProvider } from "./ordering-system/AuthProvider";
import "./App.css";

ReactGA.initialize("G-EVKLDJZFZE");

const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order" element={<OrderingSystem />} />

          {/* --- Staff Routes --- */}
          {/* The login page is public */}
          <Route path="/staff/login" element={<LoginView />} />

          {/* These routes are now protected */}
          <Route
            element={<ProtectedRoute allowedRoles={["waiter", "admin"]} />}
          >
            <Route
              path="/staff/waiter"
              element={
                <StaffLayout>
                  <WaiterView />
                </StaffLayout>
              }
            />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/staff/admin"
              element={
                <StaffLayout>
                  <AdminView />
                </StaffLayout>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;
