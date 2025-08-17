import React, { useState } from "react";
import AdminOrders from "../components/admin/AdminOrders";
import AdminMenu from "../components/admin/AdminMenu";
import AdminTables from "../components/admin/AdminTables";
import AdminOptions from "../components/admin/AdminOptions";
import AdminUsers from "../components/admin/AdminUsers";
import AdminReports from "../components/admin/AdminReports";
import AdminZones from "../components/admin/AdminZones";

export default function AdminView() {
  const [tab, setTab] = useState("reports"); // Default to the reports tab or menu

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <div className="flex flex-wrap border-b mb-6">
        <AdminTabButton tabName="reports" currentTab={tab} setTab={setTab}>
          Reports
        </AdminTabButton>
        <AdminTabButton tabName="menu" currentTab={tab} setTab={setTab}>
          Menu Management
        </AdminTabButton>
        <AdminTabButton tabName="options" currentTab={tab} setTab={setTab}>
          Options Management
        </AdminTabButton>
        <AdminTabButton tabName="users" currentTab={tab} setTab={setTab}>
          User Management
        </AdminTabButton>
        <AdminTabButton tabName="orders" currentTab={tab} setTab={setTab}>
          All Orders
        </AdminTabButton>
        <AdminTabButton tabName="zones" currentTab={tab} setTab={setTab}>
          Delivery Zones
        </AdminTabButton>
        <AdminTabButton tabName="tables" currentTab={tab} setTab={setTab}>
          Table Management
        </AdminTabButton>
      </div>
      <div>
        {tab === "reports" && <AdminReports />}
        {tab === "menu" && <AdminMenu />}
        {tab === "options" && <AdminOptions />}
        {tab === "users" && <AdminUsers />}
        {tab === "orders" && <AdminOrders />}
        {tab === "zones" && <AdminZones />}
        {tab === "tables" && <AdminTables />}
      </div>
    </div>
  );
}

function AdminTabButton({ tabName, currentTab, setTab, children }) {
  const isActive = tabName === currentTab;
  return (
    <button
      onClick={() => setTab(tabName)}
      className={`px-4 py-2 text-lg font-medium border-b-2 ${
        isActive
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}
