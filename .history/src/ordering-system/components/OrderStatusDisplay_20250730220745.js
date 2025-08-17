import React, { useEffect, useRef, useState } from "react";
import { Clock, CheckCircle, UtensilsCrossed, X, Star } from "lucide-react";
import { playNotificationSound } from "../audio";
import { useApi } from "../ApiProvider";

export default function OrderStatusDisplay({ order, setOrderStatus }) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const prevStatusRef = useRef();

  useEffect(() => {
    if (prevStatusRef.current && prevStatusRef.current !== order.status) {
      playNotificationSound();
    }
    prevStatusRef.current = order.status;
  }, [order.status]);

  const getStatusInfo = () => {
    const waitTimeDisplay = order.wait_time || order.waitTime;
    const getWaitText = (prefix) => {
      return waitTimeDisplay
        ? `${prefix} Est. wait: ${waitTimeDisplay} mins`
        : prefix;
    };

    switch (order.status) {
      case "pending":
        return {
          text: "Waiting for Confirmation",
          color: "text-gray-600",
          icon: <Clock />,
        };
      case "accepted":
        return {
          text: getWaitText("Order Accepted!"),
          color: "text-blue-600",
          icon: <CheckCircle />,
        };
      case "preparing":
        return {
          text: getWaitText("In the kitchen!"),
          color: "text-yellow-600",
          icon: <UtensilsCrossed />,
        };
      case "ready":
        return {
          text: "Your order is ready!",
          color: "text-green-600",
          icon: <CheckCircle />,
        };
      case "completed":
        return {
          text: "Order completed. Thank you!",
          color: "text-gray-800",
          icon: <CheckCircle />,
        };
      case "declined":
        return {
          text: "Order was declined.",
          color: "text-red-600",
          icon: <X />,
        };
      default:
        return {
          text: "Order status unknown",
          color: "text-gray-500",
          icon: <Clock />,
        };
    }
  };

  if (order.status === "completed" && !feedbackSubmitted) {
    return (
      <FeedbackForm order={order} setFeedbackSubmitted={setFeedbackSubmitted} />
    );
  }

  if (feedbackSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-green-600">
          <CheckCircle size={64} />
          <h2 className="text-3xl font-bold">Thank You!</h2>
          <p className="text-lg text-gray-600">
            Your feedback has been received.
          </p>
        </div>
        <button
          onClick={() => setOrderStatus(null)}
          className="mt-8 bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Start New Order
        </button>
      </div>
    );
  }

  const { text, color, icon } = getStatusInfo();
  const orderTotal = parseFloat(order.total || 0);

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Sent!</h2>
      <p className="text-gray-600 mb-6">Your order ID is #{order.id}</p>
      <div
        className={`p-6 rounded-lg bg-gray-100 flex flex-col items-center gap-4 ${color}`}
      >
        <div className="w-16 h-16">
          {React.cloneElement(icon, { size: "100%" })}
        </div>
        <p className="text-2xl font-bold">{text}</p>
      </div>
      <div className="mt-8">
        <h4 className="font-bold text-lg mb-2">Your Order Summary:</h4>
        <ul className="text-left divide-y divide-gray-200">
          {order.items.map((item, index) => (
            <li
              key={item.cartId || index}
              className="py-2 flex justify-between"
            >
              <span>
                {item.quantity} x {item.name} {item.size && `(${item.size})`}
              </span>
              <span>
                ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="font-bold text-xl flex justify-between mt-4 pt-4 border-t">
          <span>Total:</span>
          <span>${orderTotal.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={() => setOrderStatus(null)}
        className="mt-8 bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
      >
        Order Something Else
      </button>
    </div>
  );
}

function FeedbackForm({ order, setFeedbackSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    await api.submitFeedback(order.id, rating, comment);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        How was everything?
      </h2>
      <p className="text-gray-600 mb-6">Your feedback helps us improve.</p>
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
                      : "text-gray-300"
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
          placeholder="Tell us more (optional)"
          className="w-full p-2 border rounded-md h-24"
        ></textarea>
        <button
          type="submit"
          className="mt-4 bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
