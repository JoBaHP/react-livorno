import React, { useState } from "react";
import { MessageSquare } from "lucide-react";

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

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
        statusStyles[order.status]
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">
            Table {order.table_id || order.tableId}
          </h4>
          <span className="text-xs text-gray-500">#{order.id}</span>
        </div>
        <span className="text-sm font-semibold capitalize px-2 py-1 rounded-full bg-gray-200 text-gray-700">
          {order.status}
        </span>
      </div>

      {/* --- NEW: Display Order Notes --- */}
      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded">
          <div className="flex items-start gap-2">
            <MessageSquare
              size={18}
              className="text-yellow-700 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-yellow-800">{order.notes}</p>
          </div>
        </div>
      )}

      <ul className="mt-2 space-y-1 text-sm">
        {order.items.map((item, index) => (
          <li key={item.id || index} className="flex justify-between">
            <span>
              {item.quantity} x {item.name} {item.size && `(${item.size})`}
            </span>
            <span>
              ${(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t font-bold flex justify-between">
        <span>Total</span>
        <span>${orderTotal.toFixed(2)}</span>
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
