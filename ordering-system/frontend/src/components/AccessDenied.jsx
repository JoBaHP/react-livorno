import React from "react";

export default function AccessDenied({ setView, requiredRole }) {
  return (
    <div className="text-center bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You do not have permission to view the{" "}
        <span className="font-bold capitalize">{requiredRole}</span> page.
        Please log in with an appropriate account.
      </p>
      <button
        onClick={() => setView("login")}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Go to Login
      </button>
    </div>
  );
}
