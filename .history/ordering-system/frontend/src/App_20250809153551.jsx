import React from "react";
import { Routes, Route } from "react-router-dom";

// Import your main components and views
import OrderingSystem from "./OrderingSystem";
import StaffLayout from "./StaffLayout";
import LoginView from "./ordering-system/views/LoginView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
import ProtectedRoute from "./ordering-system/ProtectedRoute";
import { ApiProvider } from "./ordering-system/ApiProvider";
import { AuthProvider } from "./ordering-system/AuthProvider";

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <Routes>
          {/* Customer Route */}
          <Route path="/order" element={<OrderingSystem />} />

          {/* Staff Routes */}
          <Route path="/staff/login" element={<LoginView />} />

          {/* Protected Routes */}
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

          {/* Default route can redirect to the ordering page or a homepage */}
          <Route path="*" element={<OrderingSystem />} />
        </Routes>
      </AuthProvider>
    </ApiProvider>
  );
}

export default App;
