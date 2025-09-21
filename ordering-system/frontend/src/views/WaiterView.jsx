import React, { useState, useEffect } from "react";
import { useApi } from "../ApiProvider";
import OrderCard from "../components/OrderCard";
import { subscribeUser } from "../pushNotifications";
import { Bell, BellRing, XCircle } from "lucide-react";
import { playNotificationSound } from "../audio"; // Import the shared sound function
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export default function WaiterView() {
  const { t } = useTranslation();
  const [notificationStatus, setNotificationStatus] = useState("default");
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', { limit: 100 }],
    queryFn: () => api.getOrders({ limit: 100 }),
    staleTime: 10_000,
  });
  const orders = ordersData?.orders || [];

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationStatus("subscribed");
      } else if (Notification.permission === "denied") {
        setNotificationStatus("denied");
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const success = await subscribeUser(api);
    if (success) {
      setNotificationStatus("subscribed");
    } else if (Notification.permission === "denied") {
      setNotificationStatus("denied");
    }
  };

  useEffect(() => {
    const onNewOrder = () => {
      playNotificationSound();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    const onStatusUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    api.socket.on("new_order", onNewOrder);
    api.socket.on("order_status_update", onStatusUpdate);
    return () => {
      api.socket.off("new_order", onNewOrder);
      api.socket.off("order_status_update", onStatusUpdate);
    };
  }, [api.socket, queryClient]);

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status, waitTime }) =>
      api.updateOrderStatus(orderId, status, waitTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  const handleUpdateStatus = (orderId, status, waitTime = null) => {
    updateStatus.mutate({ orderId, status, waitTime });
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
            <BellRing size={18} /> {t('notifications_enabled')}
          </button>
        );
      case "denied":
        return (
          <button
            disabled
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold cursor-default"
          >
            <XCircle size={18} /> {t('notifications_blocked')}
          </button>
        );
      default:
        return (
          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600"
          >
            <Bell size={18} /> {t('notifications_enable')}
          </button>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{t('waiter_desk')}</h2>
        {renderNotificationButton()}
      </div>
      {isLoading ? (
        <p>{t('loading_orders')}</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-red-600 mb-4">
              {t('new_orders')} ({pendingOrders.length})
            </h3>
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500">{t('no_new_orders')}</p>
            ) : (
              <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-4">
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
              {t('active_orders')} ({activeOrders.length})
            </h3>
            {activeOrders.length === 0 ? (
              <p className="text-gray-500">{t('no_active_orders')}</p>
            ) : (
              <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-4">
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
