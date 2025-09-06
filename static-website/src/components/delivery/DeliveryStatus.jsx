import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, ChefHat, Truck, XCircle } from "lucide-react";

export default function DeliveryStatus({ order }) {
  const { t } = useTranslation();
  const getStatusInfo = () => {
    const waitTimeDisplay = order?.wait_time || order?.waitTime;

    switch (order?.status) {
      case "pending":
        return {
          text: t("delivery_status.pending_text"),
          subtext: t("delivery_status.pending_subtext"),
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
      case "accepted":
        return {
          text: t("delivery_status.accepted_text"),
          subtext: t("delivery_status.accepted_subtext", { minutes: waitTimeDisplay || "..." }),
          icon: <ChefHat size={48} />,
          color: "text-blue-500",
        };
      case "preparing":
        return {
          text: t("delivery_status.preparing_text"),
          subtext: t("delivery_status.preparing_subtext", { minutes: waitTimeDisplay || "..." }),
          icon: <ChefHat size={48} />,
          color: "text-yellow-500",
        };
      case "ready": // Assuming 'ready' means it's out for delivery
        return {
          text: t("delivery_status.ready_text"),
          subtext: t("delivery_status.ready_subtext"),
          icon: <Truck size={48} />,
          color: "text-indigo-500",
        };
      case "completed":
        return {
          text: t("delivery_status.completed_text"),
          subtext: t("delivery_status.completed_subtext"),
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
      case "declined":
        return {
          text: t("delivery_status.declined_text"),
          subtext: t("delivery_status.declined_subtext"),
          icon: <XCircle size={48} />,
          color: "text-red-500",
        };
      default:
        return {
          text: t("delivery_status.default_text"),
          subtext: t("delivery_status.default_subtext"),
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
    }
  };

  const { text, subtext, icon, color } = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className={`${color} animate-pulse`}>{icon}</div>
        <h2 className="text-3xl font-bold text-slate-800">{text}</h2>
        <p className="text-lg text-slate-600">{subtext}</p>
        {order && (
          <p className="text-sm text-slate-500 mt-4">
            {t("delivery_status.order_id", { id: order.id })}
          </p>
        )}
      </div>
    </div>
  );
}
