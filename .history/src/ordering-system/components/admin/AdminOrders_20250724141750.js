import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    api.getOrders().then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  }, [api]);

  if (isLoading) return <p>Loading all orders...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">All Orders</h3>
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
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3">#{order.id}</td>
                <td className="p-3">{order.tableId}</td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-3 capitalize">{order.status}</td>
                <td className="p-3 text-right">${order.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
