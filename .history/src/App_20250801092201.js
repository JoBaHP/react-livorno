import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ReactGA from "react-ga4";

import HomePage from "./HomePage";
import OrderingSystem from "./OrderingSystem";
import StaffLayout from "./ordering-system/StaffLayout";
import LoginView from "./ordering-system/views/LoginView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
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

          {/* Customer Route */}
          <Route path="/order" element={<OrderingSystem />} />

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/login" replace />} />
            <Route path="login" element={<LoginView />} />
            <Route path="waiter" element={<WaiterView />} />
            <Route path="admin" element={<AdminView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;
