import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../ApiProvider";

export default function AdminOrders() {
  const [data, setData] = useState({
    orders: [],
    pagination: { currentPage: 1, totalPages: 1 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const api = useApi();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const params = { page: currentPage, limit: 10 };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    try {
      const result = await api.getOrders(params);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setData({ orders: [], pagination: { currentPage: 1, totalPages: 1 } });
    } finally {
      setIsLoading(false);
    }
  }, [api, currentPage, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new filter
    // The useEffect will automatically refetch because currentPage changes,
    // but if it's already 1, we need to trigger it manually.
    if (currentPage === 1) {
      fetchOrders();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (data.pagination.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">All Orders</h3>

      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700"
        >
          Filter
        </button>
      </form>

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
