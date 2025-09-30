import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CheckCircle,
  ChefHat,
  UtensilsCrossed,
  XCircle,
  Star,
} from "lucide-react";
import { formatCurrency } from "../../utils/format";
import { useApi } from "../../ApiProvider";
import { useDispatch } from "react-redux";
import { clearOrder } from "../../store/orderSlice";
import { useNavigate } from "react-router-dom";

const STATUS_FLOW = ["pending", "accepted", "preparing", "ready", "completed"];

const STATUS_META = {
  pending: {
    icon: Clock,
    tone: "#FACC15",
  },
  accepted: {
    icon: CheckCircle,
    tone: "#22C55E",
  },
  preparing: {
    icon: ChefHat,
    tone: "#38BDF8",
  },
  ready: {
    icon: UtensilsCrossed,
    tone: "#C084FC",
  },
  completed: {
    icon: CheckCircle,
    tone: "#22C55E",
  },
  declined: {
    icon: XCircle,
    tone: "#EF4444",
  },
};

const normaliseOptions = (options = []) =>
  options.map((opt) => {
    const price = parseFloat(opt.price || 0);
    const rawQty = Number(opt.quantity);
    const quantity = Number.isFinite(rawQty) ? rawQty : price > 0 ? 1 : 0;
    return {
      ...opt,
      price,
      quantity,
    };
  });

const calculateLineTotals = (item) => {
  const quantity = item.quantity || 0;
  const basePrice = parseFloat(item.price || 0);
  const options = normaliseOptions(
    item.selected_options || item.selectedOptions || []
  );
  const paidOptionsPerUnit = options.reduce((sum, opt) => {
    if (opt.price <= 0 || opt.quantity <= 0) return sum;
    return sum + opt.price * opt.quantity;
  }, 0);
  const baseLineTotal = basePrice * quantity;
  const optionsLineTotal = paidOptionsPerUnit * quantity;
  return {
    quantity,
    basePrice,
    options,
    baseLineTotal,
    optionsLineTotal,
    lineTotal: baseLineTotal + optionsLineTotal,
  };
};

export default function DeliveryStatus({ order }) {
  const { t, i18n } = useTranslation();
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const feedbackKey = order?.id ? `delivery_feedback_${order.id}` : null;

  useEffect(() => {
    if (!feedbackKey) return;
    try {
      const stored = localStorage.getItem(feedbackKey);
      setFeedbackSubmitted(stored === "true");
    } catch {
      setFeedbackSubmitted(false);
    }
    setRating(0);
    setHoverRating(0);
    setComment("");
    setFeedbackError("");
  }, [feedbackKey]);

  const waitTimeDisplay = order?.wait_time || order?.waitTime;
  const paymentMethod = order?.payment_method || order?.paymentMethod;
  const normalisedStatus = order?.status || "pending";
  const statusIndex = Math.max(
    0,
    STATUS_FLOW.indexOf(normalisedStatus.toLowerCase())
  );
  const statusTone = STATUS_META[normalisedStatus]?.tone || "#FACC15";
  const StatusIcon = STATUS_META[normalisedStatus]?.icon || Clock;

  const itemsWithTotals = useMemo(
    () =>
      (order?.items || []).map((item) => ({
        item,
        ...calculateLineTotals(item),
      })),
    [order?.items]
  );

  const itemsSubtotal = itemsWithTotals.reduce(
    (sum, entry) => sum + entry.lineTotal,
    0
  );

  const rawDeliveryFee = parseFloat(
    order?.delivery_fee || order?.deliveryFee || 0
  );
  const hasDeliveryFee = Number.isFinite(rawDeliveryFee) && rawDeliveryFee > 0;
  const deliveryFee = hasDeliveryFee ? rawDeliveryFee : 0;
  const deliveryFeeDisplay = hasDeliveryFee
    ? formatCurrency(deliveryFee, i18n.language)
    : t("delivery_status.delivery_fee_pending");
  const total = parseFloat(order?.total || itemsSubtotal + deliveryFee || 0);

  const progressPercent =
    STATUS_FLOW.length > 1
      ? Math.min(1, statusIndex / (STATUS_FLOW.length - 1)) * 100
      : 0;

  if (!order) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto bg-black border border-golden rounded-2xl shadow-2xl p-8 md:p-10 animate-fade-in">
      {order.status !== "completed" && (
        <>
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: `${statusTone}1A`,
                  border: `2px solid ${statusTone}`,
                  color: statusTone,
                }}
              >
                <StatusIcon size={36} />
              </div>
              <div>
                <h4 className="headtext__cormorant text-3xl md:text-4xl text-white">
                  {t(`delivery_status.steps.${normalisedStatus}`, {
                    defaultValue: t("delivery_status.steps.pending"),
                  })}
                </h4>
                <p
                  className="p__opensans text-sm md:text-base"
                  style={{ color: "var(--color-grey)" }}
                >
                  {t(`delivery_status.messages.${normalisedStatus}`, {
                    minutes: waitTimeDisplay || "…",
                    defaultValue: t("delivery_status.messages.pending", {
                      minutes: waitTimeDisplay || "…",
                    }),
                  })}
                </p>
                <p
                  className="p__opensans text-xs md:text-sm mt-2"
                  style={{ color: "var(--color-grey)" }}
                >
                  {t("delivery_status.order_id", { id: order.id })}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {waitTimeDisplay && (
                <div
                  className="p-4 rounded-xl border"
                  style={{ borderColor: statusTone, color: statusTone }}
                >
                  <p className="p__opensans uppercase text-xs tracking-widest">
                    {t("delivery_status.estimated_wait")}
                  </p>
                  <p className="headtext__cormorant text-3xl">
                    {t("delivery_status.minutes", { minutes: waitTimeDisplay })}
                  </p>
                </div>
              )}
              <div
                className="p-4 rounded-xl border"
                style={{
                  borderColor: "var(--color-golden)",
                  color: "var(--color-golden)",
                }}
              >
                <p className="p__opensans uppercase text-xs tracking-widest">
                  {t("delivery_status.delivery_fee_label")}
                </p>
                <p className="headtext__cormorant text-3xl">
                  {deliveryFeeDisplay}
                </p>
              </div>
            </div>
          </header>

          <div className="relative mb-10">
            <div className="h-1 w-full bg-[#222] rounded-full"></div>
            <div
              className="h-1 rounded-full absolute top-0 left-0 transition-all duration-700"
              style={{ width: `${progressPercent}%`, background: statusTone }}
            ></div>
            <div className="flex justify-between mt-4">
              {STATUS_FLOW.map((key, idx) => {
                const Icon = STATUS_META[key]?.icon || Clock;
                const active = idx <= statusIndex;
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full border"
                      style={{
                        borderColor: active ? statusTone : "#444",
                        color: active ? statusTone : "var(--color-grey)",
                        background: active ? `${statusTone}1A` : "transparent",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className="p__opensans text-xs uppercase tracking-wide"
                      style={{
                        color: active ? statusTone : "var(--color-grey)",
                      }}
                    >
                      {t(`delivery_status.steps.${key}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {order.status !== "completed" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0B0B0B] border border-golden rounded-xl p-6">
            <h5 className="headtext__cormorant text-2xl text-white mb-4">
              {t("delivery_status.order_summary")}
            </h5>
            <ul className="space-y-4">
              {itemsWithTotals.map(
                ({ item, options, baseLineTotal, optionsLineTotal }, idx) => {
                  const displayOptions = options.filter((opt) =>
                    opt.price > 0 ? opt.quantity > 0 : true
                  );
                  return (
                    <li
                      key={item.cartId || idx}
                      className="p__opensans text-sm md:text-base"
                      style={{ color: "var(--color-grey)" }}
                    >
                      <div className="flex justify-between gap-4">
                        <span>
                          {item.quantity} × {item.name}
                          {item.size ? ` (${item.size})` : ""}
                        </span>
                        <span className="text-white">
                          {formatCurrency(
                            baseLineTotal + optionsLineTotal,
                            i18n.language
                          )}
                        </span>
                      </div>
                      {displayOptions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs md:text-sm">
                          {displayOptions.map((opt) => (
                            <li
                              key={opt.id}
                              className="flex justify-between pl-4 gap-4"
                              style={{ color: "var(--color-grey)" }}
                            >
                              <span>
                                • {opt.name}
                                {opt.price > 0 && opt.quantity > 0
                                  ? ` × ${opt.quantity}`
                                  : ""}
                              </span>
                              {opt.price > 0 && opt.quantity > 0 && (
                                <span className="text-white">
                                  {formatCurrency(
                                    opt.price * opt.quantity,
                                    i18n.language
                                  )}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
              )}
            </ul>
          </div>
          <div className="bg-[#0B0B0B] border border-golden rounded-xl p-6 flex flex-col gap-4">
            <div>
              <p
                className="p__opensans text-sm uppercase tracking-widest"
                style={{ color: "var(--color-grey)" }}
              >
                {t("delivery_status.delivery_address")}
              </p>
              <p className="p__opensans text-base text-white mt-1">
                {order.customer_address}
              </p>
              <div
                className="grid grid-cols-2 gap-3 text-sm mt-4"
                style={{ color: "var(--color-grey)" }}
              >
                {order.customer_name && (
                  <div>
                    <span className="block uppercase text-xs tracking-widest">
                      {t("delivery_status.customer")}
                    </span>
                    <span className="text-white">{order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <span className="block uppercase text-xs tracking-widest">
                      {t("delivery_status.phone")}
                    </span>
                    <span className="text-white">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <div
                className="flex justify-between p__opensans text-sm"
                style={{ color: "var(--color-grey)" }}
              >
                <span>{t("delivery_status.items_total")}</span>
                <span className="text-white">
                  {formatCurrency(itemsSubtotal, i18n.language)}
                </span>
              </div>
              <div
                className="flex justify-between p__opensans text-sm"
                style={{ color: "var(--color-grey)" }}
              >
                <span>{t("delivery_status.delivery_fee")}</span>
                <span className="text-white">
                  {hasDeliveryFee
                    ? formatCurrency(deliveryFee, i18n.language)
                    : t("delivery_status.delivery_fee_pending")}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-golden pt-3 mt-4">
                <span className="headtext__cormorant text-2xl text-white">
                  {t("delivery_status.total")}
                </span>
                <span
                  className="headtext__cormorant text-3xl"
                  style={{ color: statusTone }}
                >
                  {formatCurrency(total, i18n.language)}
                </span>
              </div>
              {paymentMethod && (
                <p
                  className="p__opensans text-xs uppercase tracking-widest"
                  style={{ color: "var(--color-grey)" }}
                >
                  {t("delivery_status.payment", { method: paymentMethod })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {order.status === 'declined' && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => { try { localStorage.removeItem(`delivery_feedback_${order.id}`); } catch {} navigate('/delivery'); }}
            className="custom__button"
          >
            {t('back_to_menu')}
          </button>
        </div>
      )}

      {order.status === "completed" && (
        <div className="bg-[#0B0B0B] border border-golden rounded-xl p-6 mt-6">
          {!feedbackSubmitted ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!rating) {
                  setFeedbackError(t("delivery_feedback.rating_required"));
                  return;
                }
                if (!order?.id) return;
                setSubmitting(true);
                setFeedbackError("");
                try {
                  await api.submitFeedback(order.id, rating, comment);
                  setFeedbackSubmitted(true);
                  if (feedbackKey) {
                    try {
                      localStorage.setItem(feedbackKey, "true");
                    } catch {}
                  }
                  dispatch(clearOrder());
                  navigate("/delivery");
                } catch (err) {
                  setFeedbackError(err.message || t("delivery_feedback.error"));
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <h5 className="headtext__cormorant text-2xl text-white">
                  {t("delivery_feedback.title")}
                </h5>
                <p
                  className="p__opensans text-sm mt-1"
                  style={{ color: "var(--color-grey)" }}
                >
                  {t("delivery_feedback.help")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0 bg-transparent border-none"
                    aria-label={t("delivery_feedback.star_label", { value })}
                  >
                    <Star
                      size={32}
                      className="transition-colors"
                      color={
                        value <= (hoverRating || rating)
                          ? "#DCCA87"
                          : "var(--color-grey)"
                      }
                      fill={
                        value <= (hoverRating || rating)
                          ? "#DCCA87"
                          : "transparent"
                      }
                    />
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="delivery-feedback-comment"
                  className="p__opensans text-sm block mb-2"
                >
                  {t("delivery_feedback.comment_label")}
                </label>
                <textarea
                  id="delivery-feedback-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("delivery_feedback.placeholder")}
                  className="w-full bg-black border border-golden rounded-md p-3 text-sm text-white"
                  rows={3}
                />
              </div>
              {feedbackError && (
                <p className="p__opensans text-sm text-red-400">
                  {feedbackError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="custom__button"
              >
                {submitting
                  ? t("delivery_feedback.submitting")
                  : t("delivery_feedback.submit")}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <CheckCircle
                size={42}
                className="mx-auto"
                style={{ color: "var(--color-golden)" }}
              />
              <h3 className="headtext__cormorant text-2xl text-white">
                {t("delivery_feedback.thanks")}
              </h3>
              <p
                className="p__opensans text-sm"
                style={{ color: "var(--color-grey)" }}
              >
                {t("delivery_feedback.thanks_subtext")}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
