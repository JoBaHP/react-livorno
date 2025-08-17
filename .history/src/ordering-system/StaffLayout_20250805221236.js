import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { UtensilsCrossed, LogOut } from "lucide-react";
import logo from "../assets/livorno-logo.png";

// The layout now accepts 'children' to render the protected page
export default function StaffLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}

// Header component remains largely the same
function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/staff/login");
  };

  const NavButton = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-gray-700 hover:bg-gray-200"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="text-indigo-600" size={28} />
          <img src={logo} alt="House image" height={200} width={200} />
          <h1 className="text-2xl font-bold text-gray-800">Livorno - Staff</h1>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <NavButton to="/staff/waiter">Waiter Desk</NavButton>
            {user.role === "admin" && (
              <NavButton to="/staff/admin">Admin Panel</NavButton>
            )}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome, {user.username} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
