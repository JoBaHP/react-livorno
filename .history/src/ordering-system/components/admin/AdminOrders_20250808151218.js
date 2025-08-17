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
  const [filters, setFilters] = useState({
    activeDateFilter: "today",
    tableId: "",
    orderId: "",
    status: "",
  });
  const [sorting, setSorting] = useState({
    sortBy: "created_at",
    sortOrder: "DESC",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const api = useApi();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const dateFilters = getDateRange(filters.activeDateFilter);
    const params = {
      page: currentPage,
      limit: 10,
      ...dateFilters,
      tableId: filters.tableId,
      orderId: filters.orderId,
      status: filters.status,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    };

    try {
      const result = await api.getOrders(params);
      if (result && result.orders) setData(result);
      else
        setData({ orders: [], pagination: { currentPage: 1, totalPages: 1 } });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, currentPage, filters, sorting]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders();
    }, 500); // Debounce text inputs
    return () => clearTimeout(handler);
  }, [filters.tableId, filters.orderId, fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [
    currentPage,
    filters.activeDateFilter,
    filters.status,
    sorting,
    fetchOrders,
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (column) => {
    setCurrentPage(1);
    setSorting((prev) => ({
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === "DESC" ? "ASC" : "DESC",
    }));
  };

  const SortableHeader = ({ column, title }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 font-bold"
    >
      {title}
      {sorting.sortBy === column &&
        (sorting.sortOrder === "DESC" ? (
          <ArrowDown size={16} />
        ) : (
          <ArrowUp size={16} />
        ))}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* ... (Date filter buttons are the same) ... */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">
                    Order ID
                    <input
                      type="search"
                      name="orderId"
                      placeholder="Search..."
                      value={filters.orderId}
                      onChange={handleFilterChange}
                      className="mt-1 block w-24 px-2 py-1 border rounded-md text-sm font-normal"
                    />
                  </th>
                  <th className="p-3">
                    Table
                    <input
                      type="search"
                      name="tableId"
                      placeholder="Search..."
                      value={filters.tableId}
                      onChange={handleFilterChange}
                      className="mt-1 block w-24 px-2 py-1 border rounded-md text-sm font-normal"
                    />
                  </th>
                  <th className="p-3">
                    <SortableHeader column="created_at" title="Date" />
                  </th>
                  <th className="p-3">
                    Status
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full px-2 py-1 border rounded-md text-sm font-normal bg-white"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </th>
                  <th className="p-3 text-center">Feedback</th>
                  <th className="p-3 text-right">
                    <SortableHeader column="total" title="Total" />
                  </th>
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
                      {/* ... feedback button ... */}
                    </td>
                    <td className="p-3 text-right">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ... (pagination and feedback modal are the same) ... */}
        </>
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
