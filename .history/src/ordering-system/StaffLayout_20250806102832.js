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
