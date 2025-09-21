import React from "react";
import { Routes, Route } from "react-router-dom";

// Import your main components and views
import OrderingSystem from "./OrderingSystem";
import StaffLayout from "./StaffLayout";
import LoginView from "./views/LoginView";
import WaiterView from "./views/WaiterView";
import AdminView from "./views/AdminView";
import ProtectedRoute from "./ProtectedRoute";
import { ApiProvider } from "./ApiProvider";
import { AuthProvider } from "./AuthProvider";
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <ApiProvider>
      <Provider store={store}>
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
      </Provider>
    </ApiProvider>
  );
}

export default App;
