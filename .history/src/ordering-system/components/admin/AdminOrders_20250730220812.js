import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../ApiProvider";
import { Star, MessageSquare } from "lucide-react";

const formatToYMD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getDateRange = (filter) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  switch (filter) {
    case "today":
      break;
    case "yesterday":
      startDate.setDate(now.getDate() - 1);
      endDate.setDate(now.getDate() - 1);
      break;
    case "lastWeek":
      startDate.setDate(now.getDate() - now.getDay() - 7);
      endDate.setDate(now.getDate() - now.getDay() - 1);
      break;
    case "thisMonth":
      startDate.setDate(1);
      endDate = now;
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
      return {};
  }
  if (endDate < startDate) return {};
  return { startDate: formatToYMD(startDate), endDate: formatToYMD(endDate) };
};

export default function AdminOrders() {
  const [data, setData] = useState({
    orders: [],
    pagination: { currentPage: 1, totalPages: 1 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const api = useApi();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const dateFilters = getDateRange(activeFilter);
    const params = { page: currentPage, limit: 10, ...dateFilters };
    try {
      const result = await api.getOrders(params);
      if (result && result.orders && result.pagination) setData(result);
      else
        setData({ orders: [], pagination: { currentPage: 1, totalPages: 1 } });
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
    setCurrentPage(1);
    setActiveFilter(filter);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (data.pagination.totalPages || 1))
      setCurrentPage(newPage);
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
      <h3 className="text-xl font-bold mb-4">All Orders</h3>
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
                  <th className="p-3 text-center">Feedback</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">#{order.id}</td>
                    <td className="p-3">{order.table_id}</td>
                    <td className="p-3">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 capitalize">{order.status}</td>
                    <td className="p-3 text-center">
                      {order.feedback_rating && (
                        <button
                          onClick={() => setSelectedFeedback(order)}
                          className="flex items-center justify-center w-full gap-1 text-blue-600 hover:underline"
                        >
                          <Star size={16} className="text-yellow-500" />{" "}
                          {order.feedback_rating}
                          {order.feedback_comment && (
                            <MessageSquare size={16} />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      ${parseFloat(order.total || 0).toFixed(2)}
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
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      {selectedFeedback && (
        <FeedbackModal
          order={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}

function FeedbackModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          Feedback for Order #{order.id}
        </h3>
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={24}
              className={
                i < order.feedback_rating ? "text-yellow-400" : "text-gray-300"
              }
              fill="currentColor"
            />
          ))}
          <span className="ml-2 text-lg font-bold">
            ({order.feedback_rating} / 5)
          </span>
        </div>
        {order.feedback_comment ? (
          <p className="bg-gray-100 p-3 rounded-md">{order.feedback_comment}</p>
        ) : (
          <p className="text-gray-500 italic">No comment was left.</p>
        )}
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
