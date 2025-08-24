import React, { useState } from "react";
import {
  MessageSquare,
  CreditCard,
  DollarSign,
  User,
  Phone,
  MapPin,
  Truck,
} from "lucide-react";

export default function OrderCard({ order, onUpdate }) {
  const [waitTime, setWaitTime] = useState(15);

  const statusStyles = {
    pending: "border-red-500",
    accepted: "border-blue-500",
    preparing: "border-yellow-500",
    ready: "border-green-500",
    completed: "border-gray-400",
    declined: "border-gray-400",
  };

  const renderActions = () => {
    switch (order.status) {
      case "pending":
        return (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`wait-time-${order.id}`}
                className="text-sm font-medium"
              >
                Wait (mins):
              </label>
              <input
                id={`wait-time-${order.id}`}
                type="number"
                value={waitTime}
                onChange={(e) => setWaitTime(parseInt(e.target.value))}
                className="w-20 p-1 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(order.id, "accepted", waitTime)}
                className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => onUpdate(order.id, "declined")}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        );
      case "accepted":
        return (
          <button
            onClick={() => onUpdate(order.id, "preparing")}
            className="mt-4 w-full bg-yellow-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-yellow-600"
          >
            Mark as Preparing
          </button>
        );
      case "preparing":
        return (
          <button
            onClick={() => onUpdate(order.id, "ready")}
            className="mt-4 w-full bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-600"
          >
            Mark as Ready
          </button>
        );
      case "ready":
        return (
          <button
            onClick={() => onUpdate(order.id, "completed")}
            className="mt-4 w-full bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-800"
          >
            Complete Order
          </button>
        );
      default:
        return null;
    }
  };

  const orderTotal = parseFloat(order.total || 0);
  const waitTimeDisplay = order.wait_time || order.waitTime;
  const paymentMethod = order.payment_method || order.paymentMethod;
  const isDelivery = order.order_type === "delivery";
  const orderTime = new Date(
    order.created_at || order.createdAt
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const subtotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const deliveryFee = isDelivery ? orderTotal - subtotal : 0;

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
        statusStyles[order.status]
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          {isDelivery ? (
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Truck size={20} /> Delivery Order
            </h4>
          ) : (
            <h4 className="font-bold text-lg">
              Table {order.table_id || order.tableId}
            </h4>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>#{order.id}</span>
            <span className="font-semibold">{orderTime}</span>
          </div>
        </div>
        <span className="text-sm font-semibold capitalize px-2 py-1 rounded-full bg-slate-200 text-slate-700">
          {order.status}
        </span>
      </div>

      {isDelivery && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-slate-500" />{" "}
            <span className="font-semibold">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-slate-500" />{" "}
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="text-slate-500 mt-0.5" />{" "}
            <span>{order.customer_address}</span>
          </div>
        </div>
      )}

      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded">
          <div className="flex items-start gap-2">
            <MessageSquare
              size={18}
              className="text-yellow-700 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-yellow-800 font-medium">{order.notes}</p>
          </div>
        </div>
      )}

      <ul className="mt-2 space-y-1 text-sm">
        {order.items.map((item, index) => {
          const selectedOptions = item.selected_options || item.selectedOptions;
          return (
            <li key={item.id || index}>
              <div className="flex justify-between">
                <span>
                  {item.quantity} x {item.name} {item.size && `(${item.size})`}
                </span>
                <span>
                  ${(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                </span>
              </div>
              {selectedOptions && selectedOptions.length > 0 && (
                <ul className="text-xs text-slate-500 pl-4 list-disc mt-1">
                  {selectedOptions.map((opt) => (
                    <li key={opt.id}>
                      {opt.quantity > 1 ? `${opt.quantity} x ` : ""}
                      {opt.name}
                      {parseFloat(opt.price) > 0 &&
                        ` (+$${parseFloat(opt.price).toFixed(2)})`}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {isDelivery && deliveryFee > 0 && (
          <li className="flex justify-between pt-1 mt-1 border-t border-dashed">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </li>
        )}
      </ul>

      <div className="mt-2 pt-2 border-t font-bold flex justify-between items-center">
        <span>Total: ${orderTotal.toFixed(2)}</span>
        {paymentMethod && (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            {paymentMethod === "card" ? (
              <CreditCard size={18} />
            ) : (
              <DollarSign size={18} />
            )}
            <span className="capitalize">{paymentMethod}</span>
          </div>
        )}
      </div>

      {waitTimeDisplay && (
        <p className="text-sm text-blue-600 mt-1">
          Est. Wait: {waitTimeDisplay} mins
        </p>
      )}
      {renderActions()}
    </div>
  );
}
