import React, { useState, useEffect } from "react";
import { useApi } from "../ApiProvider";
import OrderCard from "../components/OrderCard";

export default function WaiterView() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    api.getOrders().then((data) => {
      setOrders(data.filter((o) => o.status !== "completed"));
      setIsLoading(false);
    });

    const onNewOrder = (newOrder) => setOrders((prev) => [newOrder, ...prev]);
    const onStatusUpdate = (updatedOrder) =>
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

    api.socket.on("new_order", onNewOrder);
    api.socket.on("order_status_update", onStatusUpdate);

    return () => {
      api.socket.off("new_order", onNewOrder);
      api.socket.off("order_status_update", onStatusUpdate);
    };
  }, [api]);

  const handleUpdateStatus = (orderId, status, waitTime = null) => {
    api.updateOrderStatus(orderId, status, waitTime);
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter(
    (o) => !["pending", "completed", "declined"].includes(o.status)
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Waiter Desk</h2>
      {isLoading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-red-600 mb-4">
              New Orders ({pendingOrders.length})
            </h3>
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500">No new orders.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">
              Active Orders ({activeOrders.length})
            </h3>
            {activeOrders.length === 0 ? (
              <p className="text-gray-500">No active orders.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
