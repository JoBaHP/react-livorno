import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { UtensilsCrossed, LogOut } from "lucide-react";

export default function StaffLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

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
        `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <header className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full">
            <UtensilsCrossed className="text-indigo-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TableOrder - Staff Panel
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-700 p-1 rounded-lg">
              <NavButton to="/staff/waiter">Waiter Desk</NavButton>
              {user.role === "admin" && (
                <NavButton to="/staff/admin">Admin Panel</NavButton>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 hidden md:inline">
                Welcome,{" "}
                <span className="font-bold text-slate-200">
                  {user.username}
                </span>{" "}
                ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-red-500 transition-colors"
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
