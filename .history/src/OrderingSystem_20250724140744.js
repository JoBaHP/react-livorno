import React, { useState, useEffect } from "react";
import { ApiProvider } from "./ordering-system/ApiProvider";
import { AuthProvider, useAuth } from "./ordering-system/AuthProvider";
import CustomerView from "./ordering-system/views/CustomerView";
import WaiterView from "./ordering-system/views/WaiterView";
import AdminView from "./ordering-system/views/AdminView";
import LoginView from "./ordering-system/views/LoginView";
import AccessDenied from "./ordering-system/components/AccessDenied";
import {
  UtensilsCrossed,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";

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
  const [view, setView] = useState("customer");
  const [tableId, setTableId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableId(parseInt(table, 10));
      setView("customer");
    }
  }, []);

  const renderView = () => {
    if (view === "waiter" && (!user || user.role !== "waiter"))
      return <AccessDenied setView={setView} requiredRole="waiter" />;
    if (view === "admin" && (!user || user.role !== "admin"))
      return <AccessDenied setView={setView} requiredRole="admin" />;

    switch (view) {
      case "login":
        return <LoginView setView={setView} />;
      case "waiter":
        return <WaiterView />;
      case "admin":
        return <AdminView />;
      case "customer":
      default:
        return <CustomerView tableId={tableId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header
        setView={setView}
        view={view}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="container mx-auto p-4 md:p-6">{renderView()}</main>
    </div>
  );
}

function Header({ setView, view, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, logout } = useAuth();

  const NavButton = ({ targetView, children, requiresAuth = false }) => {
    const isActive = view === targetView;
    const isDisabled = requiresAuth && !user;
    const handleClick = () => {
      if (!isDisabled) {
        setView(targetView);
        setIsMobileMenuOpen(false);
      }
    };
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-gray-700 hover:bg-gray-200"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {children}
      </button>
    );
  };

  const AuthButton = () => {
    if (user) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Welcome, <span className="font-bold">{user.username}</span> (
            {user.role})
          </span>
          <button
            onClick={() => {
              logout();
              setView("customer");
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => {
          setView("login");
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
      >
        <LogIn size={16} /> Staff Login
      </button>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="text-indigo-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">TableOrder</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <NavButton targetView="customer">Menu</NavButton>
            <NavButton targetView="waiter" requiresAuth>
              Waiter Desk
            </NavButton>
            <NavButton targetView="admin" requiresAuth>
              Admin Panel
            </NavButton>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <AuthButton />
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <NavButton targetView="customer">Menu</NavButton>
              <NavButton targetView="waiter" requiresAuth>
                Waiter Desk
              </NavButton>
              <NavButton targetView="admin" requiresAuth>
                Admin Panel
              </NavButton>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
