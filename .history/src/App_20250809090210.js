import React from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./HomePage";
import OrderingSystem from "./OrderingSystem";
import StaffLayout from "../ordering-system/frontend/StaffLayout";
import LoginView from "./ordering-system/views/LoginView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
import ProtectedRoute from "./ordering-system/ProtectedRoute";
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
          <Route path="/staff/login" element={<LoginView />} />

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
