import React, { useState } from "react";
import AdminOrders from "../components/admin/AdminOrders";
import AdminMenu from "../components/admin/AdminMenu";
import AdminTables from "../components/admin/AdminTables";
import AdminOptions from "../components/admin/AdminOptions";
import AdminUsers from "../components/admin/AdminUsers";
import AdminReports from "../components/admin/AdminReports";
import AdminZones from "../components/admin/AdminZones";
import AdminStreets from "../components/admin/AdminStreets";

export default function AdminView() {
  const [tab, setTab] = useState("reports");
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = [
    { key: "reports", label: "Reports", icon: IconChart },
    { key: "menu", label: "Menu Management", icon: IconList },
    { key: "options", label: "Options Management", icon: IconSliders },
    { key: "zones", label: "Delivery Zones", icon: IconMap },
    { key: "streets", label: "Street Management", icon: IconRoad },
    { key: "users", label: "User Management", icon: IconUsers },
    { key: "orders", label: "All Orders", icon: IconReceipt },
    { key: "tables", label: "Table Management", icon: IconTable },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:shrink-0 border-r border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">AP</span>
            <h2 className="text-xl font-semibold text-slate-800">Admin Panel</h2>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-3 space-y-1">
          {sections.map((s) => (
            <AdminNavButton
              key={s.key}
              tabName={s.key}
              currentTab={tab}
              setTab={(t) => setTab(t)}
              Icon={s.icon}
            >
              {s.label}
            </AdminNavButton>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1">
        {/* Mobile header with hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">AP</span>
              <h2 className="text-lg font-semibold text-slate-800">Admin Panel</h2>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setMobileOpen(true)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile slide-over menu */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="text-lg font-semibold text-slate-800">Manage</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 overflow-auto p-3 space-y-1">
                {sections.map((s) => (
                  <AdminNavButton
                    key={s.key}
                    tabName={s.key}
                    currentTab={tab}
                    setTab={(t) => {
                      setTab(t);
                      setMobileOpen(false);
                    }}
                    Icon={s.icon}
                  >
                    {s.label}
                  </AdminNavButton>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="hidden md:flex items-end justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Admin Panel</h1>
                <p className="text-slate-500 text-sm">Manage menu, orders, users and more</p>
              </div>
            </div>
            {tab === "reports" && <AdminReports />}
            {tab === "menu" && <AdminMenu />}
            {tab === "options" && <AdminOptions />}
            {tab === "zones" && <AdminZones />}
            {tab === "streets" && <AdminStreets />}
            {tab === "users" && <AdminUsers />}
            {tab === "orders" && <AdminOrders />}
            {tab === "tables" && <AdminTables />}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminNavButton({ tabName, currentTab, setTab, children, Icon }) {
  const isActive = tabName === currentTab;
  return (
    <button
      onClick={() => setTab(tabName)}
      className={`group w-full text-left px-3 py-2.5 text-[15px] font-medium rounded-md border-l-4 transition-all duration-150 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
        isActive
          ? "bg-indigo-50 text-indigo-700 border-indigo-600 shadow-[inset_0_1px_0_rgba(99,102,241,0.15)]"
          : "text-slate-700 hover:bg-slate-50 border-transparent"
      }`}
    >
      {Icon ? (
        <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

// --- Minimal inline icons (no dependency) ---
function IconChart({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" />
      <path d="M7 15l3-3 4 4 5-7" />
    </svg>
  );
}
function IconList({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconSliders({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" />
      <circle cx="4" cy="12" r="2" /><circle cx="12" cy="10" r="2" /><circle cx="20" cy="16" r="2" />
    </svg>
  );
}
function IconMap({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18l-6 3V3l6-2 6 2 6-2v18l-6 2-6-2z" />
      <path d="M9 2v16M15 4v16" />
    </svg>
  );
}
function IconRoad({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 22L10 2" /><path d="M18 22L14 2" /><path d="M12 8v4m0 4v4" />
    </svg>
  );
}
function IconUsers({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconReceipt({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V3l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2v18l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}
function IconTable({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <path d="M3 10v10M21 10v10M12 10v10" />
    </svg>
  );
}
