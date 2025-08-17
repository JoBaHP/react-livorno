import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../ApiProvider";

// Helper function to get date ranges
const getDateRange = (filter) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  // Set time to the beginning of the day for start dates
  startDate.setHours(0, 0, 0, 0);
  // Set time to the end of the day for end dates
  endDate.setHours(23, 59, 59, 999);

  switch (filter) {
    case "today":
      // Already set
      break;
    case "yesterday":
      startDate.setDate(now.getDate() - 1);
      endDate.setDate(now.getDate() - 1);
      break;
    case "lastWeek":
      // Start of last week (Sunday)
      startDate.setDate(now.getDate() - now.getDay() - 7);
      // End of last week (Saturday)
      endDate.setDate(now.getDate() - now.getDay() - 1);
      break;
    case "thisMonth":
      startDate.setDate(1);
      endDate = now; // up to the current moment today
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      break;
    case "lastYear":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      return {}; // No filter
  }

  return {
    startDate: startDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
    endDate: endDate.toISOString().split("T")[0],
  };
};

export default function AdminOrders() {
  const [data, setData] = useState({
    orders: [],
    pagination: { currentPage: 1, totalPages: 1 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("today"); // Default filter
  const [currentPage, setCurrentPage] = useState(1);
  const api = useApi();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const dateFilters = getDateRange(activeFilter);
    const params = { page: currentPage, limit: 10, ...dateFilters };

    try {
      const result = await api.getOrders(params);
      if (result && result.orders && result.pagination) {
        setData(result);
      } else {
        console.error("Unexpected API response structure:", result);
        setData({ orders: [], pagination: { currentPage: 1, totalPages: 1 } });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setData({ orders: [], pagination: { currentPage: 1, totalPages: 1 } });
    } finally {
      setIsLoading(false);
    }
  }, [api, currentPage, activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterClick = (filter) => {
    setCurrentPage(1); // Reset to the first page when changing filters
    setActiveFilter(filter);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (data.pagination.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const FilterButton = ({ filter, children }) => {
    const isActive = activeFilter === filter;
    return (
      <button
        onClick={() => handleFilterClick(filter)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">All Orders</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <FilterButton filter="today">Today</FilterButton>
        <FilterButton filter="yesterday">Yesterday</FilterButton>
        <FilterButton filter="lastWeek">Last Week</FilterButton>
        <FilterButton filter="thisMonth">This Month</FilterButton>
        <FilterButton filter="lastMonth">Last Month</FilterButton>
        <FilterButton filter="thisYear">This Year</FilterButton>
        <FilterButton filter="lastYear">Last Year</FilterButton>
      </div>

      {isLoading ? (
        <p className="text-center py-4">Loading orders...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">#{order.id}</td>
                    <td className="p-3">{order.tableId}</td>
                    <td className="p-3">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 capitalize">{order.status}</td>
                    <td className="p-3 text-right">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.orders.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No orders found for the selected criteria.
              </p>
            )}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              <span>
                Page {data.pagination.currentPage} of{" "}
                {data.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
