import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../ApiProvider";
import OrderCard from "../components/OrderCard";
import { subscribeUser } from "../pushNotifications";
import { Bell, BellRing, XCircle } from "lucide-react";

export default function WaiterView() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState("default");
  const api = useApi();
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationStatus("subscribed");
      } else if (Notification.permission === "denied") {
        setNotificationStatus("denied");
      }
    }
  }, []);

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch((error) => {
        console.log(
          "Audio play failed (this can happen if the user hasn't interacted with the page yet):",
          error
        );
      });
    }
  };

  const handleEnableNotifications = async () => {
    const success = await subscribeUser(api);
    if (success) {
      setNotificationStatus("subscribed");
    } else if (Notification.permission === "denied") {
      setNotificationStatus("denied");
    }
  };

  useEffect(() => {
    api
      .getOrders({ limit: 100 })
      .then((result) => {
        if (result && result.orders) {
          setOrders(result.orders.filter((o) => o.status !== "completed"));
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    const onNewOrder = (newOrder) => {
      setOrders((prev) =>
        [newOrder, ...prev].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
      playNotificationSound();
    };

    const onStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    };

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

  const renderNotificationButton = () => {
    switch (notificationStatus) {
      case "subscribed":
        return (
          <button
            disabled
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold cursor-default"
          >
            <BellRing size={18} /> Notifications Enabled
          </button>
        );
      case "denied":
        return (
          <button
            disabled
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold cursor-default"
          >
            <XCircle size={18} /> Notifications Blocked
          </button>
        );
      default:
        return (
          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600"
          >
            <Bell size={18} /> Enable Notifications
          </button>
        );
    }
  };

  return (
    <div>
      <audio
        ref={notificationSoundRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-notification-947.mp3"
        preload="auto"
      ></audio>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Waiter Desk</h2>
        {renderNotificationButton()}
      </div>
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
