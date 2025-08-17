import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../ApiProvider";
import { Star, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";

const formatToYMD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getDateRange = (filter) => {
  if (filter === "all") return {};
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
    activeDateFilter: "all",
    status: "",
    orderType: "",
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
    }, 300);
    return () => clearTimeout(handler);
  }, [filters, currentPage, sorting, fetchOrders]);

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleDateFilterClick = (filter) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, activeDateFilter: filter }));
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

  const FilterButton = ({ filter, children }) => {
    const isActive = filters.activeDateFilter === filter;
    return (
      <button
        onClick={() => handleDateFilterClick(filter)}
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
        <FilterButton filter="all">All Time</FilterButton>
        <FilterButton filter="today">Today</FilterButton>
        <FilterButton filter="yesterday">Yesterday</FilterButton>
        <FilterButton filter="lastWeek">Last Week</FilterButton>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 font-bold">Order ID</th>
                  <th className="p-3">
                    <SortableHeader column="table_id" title="Table" />
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
                  <th className="p-3 text-center">
                    <SortableHeader column="feedback_rating" title="Feedback" />
                  </th>
                  <th className="p-3 text-right font-bold">Total</th>
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
        </>
      )}
    </div>
  );
}
