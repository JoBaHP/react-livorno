import React, { useEffect, useRef, useState } from "react";
import {
  Clock,
  CheckCircle,
  UtensilsCrossed,
  X,
  Star,
  ChefHat,
} from "lucide-react";
import { playNotificationSound } from "../audio";
import { useApi } from "../ApiProvider";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";

export default function OrderStatusDisplay({
  order,
  setOrderStatus,
  onBackToMenu,
  onFeedbackSubmitted,
}) {
  const { t } = useTranslation();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const feedbackHandledRef = useRef(false);
  const prevStatusRef = useRef();

  useEffect(() => {
    if (prevStatusRef.current && prevStatusRef.current !== order.status) {
      playNotificationSound();
    }
    prevStatusRef.current = order.status;
  }, [order.status]);

  if (order.status === "completed" && !feedbackSubmitted) {
    return (
      <FeedbackForm order={order} setFeedbackSubmitted={setFeedbackSubmitted} />
    );
  }

  if (feedbackSubmitted) {
    if (!feedbackHandledRef.current && typeof onFeedbackSubmitted === "function") {
      feedbackHandledRef.current = true;
      onFeedbackSubmitted(order?.id);
    }
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
        <div className="flex flex-col items-center gap-4 text-green-500">
          <CheckCircle size={64} className="animate-bounce" />
          <h2 className="text-3xl font-bold text-slate-800">
            {t("thank_you")}
          </h2>
          <p className="text-lg text-slate-600">{t("feedback_received")}</p>
        </div>
        <button
          onClick={() => setOrderStatus(null)}
          className="mt-8 bg-amber-400 text-white py-3 px-8 rounded-lg font-semibold hover:bg-amber-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {t("start_new_order")}
        </button>
      </div>
    );
  }

  const orderTotal = parseFloat(order.total || 0);
  const statuses = ["accepted", "preparing", "ready"];
  const currentStatusIndex = statuses.indexOf(order.status);
  const waitTimeDisplay = order.wait_time || order.waitTime;

  const getStatusInfo = () => {
    switch (order.status) {
      case "pending":
        return { text: t("status.waiting"), icon: <Clock size={32} /> };
      case "accepted":
        return { text: t("status.accepted"), icon: <CheckCircle size={32} /> };
      case "preparing":
        return { text: t("status.preparing"), icon: <ChefHat size={32} /> };
      case "ready":
        return {
          text: t("status.ready"),
          icon: <UtensilsCrossed size={32} />,
        };
      case "declined":
        return { text: t("status.declined"), icon: <X size={32} /> };
      default:
        return { text: t("status.unknown"), icon: <Clock size={32} /> };
    }
  };
  const { text, icon } = getStatusInfo();

  const handleBackToMenu = () => {
    if (onBackToMenu) {
      onBackToMenu();
    } else if (typeof setOrderStatus === "function") {
      setOrderStatus(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          {t("order_in")}
        </h2>
        <p className="text-slate-600 mb-8">{t("order_id", { id: order.id })}</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl text-center mb-8">
        <div className="flex justify-center items-center gap-3 text-2xl font-bold text-indigo-600 animate-pulse">
          {icon}
          <span>{text}</span>
        </div>
        {waitTimeDisplay && (
          <p className="text-slate-600 mt-2">
            {t("estimated_wait", { minutes: waitTimeDisplay })}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full px-4 mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -translate-y-1/2"></div>
          <div
            className="absolute left-0 top-1/2 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-500"
            style={{
              width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`,
            }}
          ></div>
          {statuses.map((status, index) => (
            <div
              key={status}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-4 h-4 rounded-full transition-colors duration-500 ${
                  index <= currentStatusIndex ? "bg-indigo-600" : "bg-slate-300"
                }`}
              ></div>
              <span
                className={`mt-2 text-xs font-semibold transition-colors duration-500 ${
                  index <= currentStatusIndex
                    ? "text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg mb-2 text-slate-700">
          {t("order_summary")}
        </h4>
        <ul className="text-left divide-y divide-slate-200">
          {order.items.map((item, index) => (
            <li
              key={item.cartId || index}
              className="py-2 flex justify-between text-slate-600"
            >
              <span>
                {item.quantity} x {item.name} {item.size && `(${item.size})`}
              </span>
              <span>
                {formatCurrency(parseFloat(item.price || 0) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="font-bold text-xl flex justify-between mt-4 pt-4 border-t text-slate-800">
          <span>{t("total")}:</span>
          <span>{formatCurrency(orderTotal)}</span>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={handleBackToMenu}
          className="mt-8 bg-slate-200 text-slate-700 py-2 px-6 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
        >
          {t("back_to_menu")}
        </button>
      </div>
    </div>
  );
}

function FeedbackForm({ order, setFeedbackSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const api = useApi();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert(t("feedback_select_rating"));
      return;
    }
    await api.submitFeedback(order.id, rating, comment);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {t("feedback_title")}
      </h2>
      <p className="text-slate-600 mb-6">{t("feedback_help")}</p>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center my-4">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                type="button"
                key={index}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={40}
                  className={`cursor-pointer transition-colors ${
                    ratingValue <= (hover || rating)
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }`}
                  fill="currentColor"
                />
              </button>
            );
          })}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("feedback_placeholder")}
          className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 text-black focus:ring-amber-400 focus:border-amber-400"
        ></textarea>
        <button
          type="submit"
          className="mt-4 bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {t("feedback_submit")}
        </button>
      </form>
    </div>
  );
}
