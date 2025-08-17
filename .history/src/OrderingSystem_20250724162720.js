import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ApiProvider } from "./ordering-system/ApiProvider";
import { AuthProvider, useAuth } from "./ordering-system/AuthProvider";
import CustomerView from "./ordering-system/views/CustomerView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
import LoginView from "./ordering-system/views/LoginView";
import { UtensilsCrossed, LogIn, LogOut } from "lucide-react";

export default function OrderingSystem() {
  return (
    <ApiProvider>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ApiProvider>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <Routes>
          {/* The main route now has nested routes */}
          <Route path="/" element={<Outlet />}>
            <Route index element={<CustomerViewWrapper />} />
            <Route path="login" element={<LoginViewWrapper />} />

            {/* Protected Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["waiter", "admin"]} />}
            >
              <Route path="waiter" element={<WaiterView />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="admin" element={<AdminView />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/order");
  };

  const NavButton = ({ to, children, requiresAuth = false }) => {
    const isDisabled = requiresAuth && !user;
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-200"
          } ${
            isDisabled
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : ""
          }`
        }
      >
        {children}
      </NavLink>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">TableOrder</h1>
        </div>
        <div className="flex items-center gap-2">
          <NavButton to="/order">Menu</NavButton>
          <NavButton to="/order/waiter" requiresAuth>
            Waiter Desk
          </NavButton>
          <NavButton to="/order/admin" requiresAuth>
            Admin Panel
          </NavButton>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome, {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/order/login"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-green-600"
            >
              <LogIn size={16} />
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}

function CustomerViewWrapper() {
  const [tableId, setTableId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableId(parseInt(table, 10));
    }
  }, [location.search]);

  return <CustomerView tableId={tableId} />;
}

function LoginViewWrapper() {
  const navigate = useNavigate();
  return <LoginView navigate={navigate} />;
}

function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/order/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/order" replace />;
  }

  return <Outlet />;
}
