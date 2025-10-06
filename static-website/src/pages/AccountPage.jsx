import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../ApiProvider";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, setLoading } from "../store/authSlice";
import { setAll } from "../store/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "react-i18next";
import { FaUserCircle } from "react-icons/fa";

const selectAuthUser = (state) => state.auth.user;
const selectAuthLoading = (state) => state.auth.loading;

export default function AccountPage() {
  const api = useApi();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    dispatch(setLoading(true));
    api
      .getProfile()
      .then((data) => {
        if (!mounted) return;
        if (data && data.user) dispatch(setUser(data.user));
      })
      .catch(() => {})
      .finally(() => mounted && dispatch(setLoading(false)));
    return () => {
      mounted = false;
    };
  }, [api, dispatch]);

  const { data: ordersData, isFetching: ordersFetching } = useQuery({
    queryKey: ["userOrders"],
    queryFn: () => api.getUserOrders(),
    enabled: !!user,
  });

  const orders = useMemo(() => ordersData?.orders || [], [ordersData]);
  const frequentItems = useMemo(() => ordersData?.frequentItems || [], [ordersData]);
  const ordersLoading = ordersFetching && !ordersData;
  const ORDERS_PER_PAGE = 4;
  const FREQUENT_PER_PAGE = 4;
  const [ordersPage, setOrdersPage] = useState(1);
  const [frequentPage, setFrequentPage] = useState(1);

  useEffect(() => {
    setOrdersPage(1);
  }, [orders.length]);

  useEffect(() => {
    setFrequentPage(1);
  }, [frequentItems.length]);

  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const frequentTotalPages = Math.max(1, Math.ceil(frequentItems.length / FREQUENT_PER_PAGE));

  useEffect(() => {
    setOrdersPage((prev) => Math.min(prev, ordersTotalPages));
  }, [ordersTotalPages]);

  useEffect(() => {
    setFrequentPage((prev) => Math.min(prev, frequentTotalPages));
  }, [frequentTotalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orders, ordersPage]);

  const paginatedFrequent = useMemo(() => {
    const start = (frequentPage - 1) * FREQUENT_PER_PAGE;
    return frequentItems.slice(start, start + FREQUENT_PER_PAGE);
  }, [frequentItems, frequentPage]);

  const renderPagination = (current, total, onPrev, onNext) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
        <button
          type="button"
          onClick={onPrev}
          disabled={current <= 1}
          className="custom__button bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("pagination.previous")}
        </button>
        <span className="p__opensans text-sm" style={{ color: "var(--color-grey)" }}>
          {t("pagination.page_of", { current, total })}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={current >= total}
          className="custom__button bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("pagination.next")}
        </button>
      </div>
    );
  };
  const hasCustomAvatar = (url) => {
    if (!url) return false;
    const isGoogle = /^https:\/\/lh3\.googleusercontent\.com\//i.test(url);
    if (!isGoogle) return true;
    return url.includes("/a-/");
  };

  const handleGoogle = () => {
    const base = import.meta.env.VITE_API_URL || "";
    window.location.href = `${base}/api/auth/google`;
  };

  const handleLogout = async () => {
    await api.logout();
    dispatch(clearUser());
  };

  const normalizeOptions = (options = []) => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => {
      const id =
        opt.id ?? opt.option_id ?? opt.menu_option_id ?? opt.slug ?? opt.name;
      const price = parseFloat(opt.price || 0);
      let quantity = Number(opt.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        quantity = 0;
      }
      if (quantity === 0) {
        quantity = price > 0 ? 0 : 1;
      }
      return {
        id,
        name: opt.name,
        price,
        quantity,
      };
    });
  };

  const mapCartItems = (items = []) => {
    return items.map((it) => {
      const baseId = it.menu_item_id ?? it.id;
      const selectedOptions = normalizeOptions(
        it.selectedOptions || it.selected_options || it.options || []
      ).filter((opt) => (opt.price > 0 ? opt.quantity > 0 : true));
      const optionsKey = selectedOptions
        .map((o) => `${o.id}:${o.quantity || 1}`)
        .sort()
        .join("-");
      const safeKey = optionsKey || "base";
      return {
        id: baseId,
        name: it.name,
        price: parseFloat(it.price || 0),
        size: it.size || null,
        quantity: Number(it.quantity) || 1,
        selectedOptions,
        cartId: `${baseId}-${it.size || "std"}-${safeKey}`,
      };
    });
  };

  const handleReorder = async (order) => {
    const items = mapCartItems(order.items || []);
    const res = await api.repriceOrder(items);
    const validated = mapCartItems(res.items || items);
    dispatch(setAll(validated));
    try {
      sessionStorage.setItem(
        "reorderMsg",
        JSON.stringify({
          warnings: res.warnings || [],
          ok: true,
          ts: Date.now(),
        })
      );
    } catch {}
    navigate("/delivery?view=checkout");
  };

  const handleQuickReorder = async (itemTemplate) => {
    const items = mapCartItems([
      {
        ...itemTemplate,
        quantity: itemTemplate.quantity || 1,
      },
    ]);
    const res = await api.repriceOrder(items);
    const validated = mapCartItems(res.items || items);
    dispatch(setAll(validated));
    try {
      sessionStorage.setItem(
        "reorderMsg",
        JSON.stringify({
          warnings: res.warnings || [],
          ok: true,
          ts: Date.now(),
        })
      );
    } catch {}
    navigate("/delivery?view=checkout");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 flex justify-center">
          {!user ? (
            <div className="max-w-md bg-gray-900 border border-golden p-6 rounded-lg">
              <p
                className="p__opensans mb-4"
                style={{ color: "var(--color-grey)" }}
              >
                Sign in with Google to access your past orders and faster
                checkout.
              </p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="custom__button w-full"
              >
                {loading ? "Checking session..." : "Sign in with Google"}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-6">
              <div className="bg-gray-900 border border-golden rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {hasCustomAvatar(user?.picture) ? (
                    <img
                      src={user.picture}
                      alt={user.name || user.username || "User"}
                      className="w-16 h-16 rounded-full object-cover border border-golden"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(220, 202, 135, 0.15)",
                        border: "1px solid var(--color-golden)",
                        color: "var(--color-golden)",
                      }}
                    >
                      <FaUserCircle size={48} />
                    </div>
                  )}
                  <div>
                    <p className="p__cormorant text-2xl">
                      {user.name || user.username || user.email}
                    </p>
                    <p
                      className="p__opensans text-sm"
                      style={{ color: "var(--color-grey)" }}
                    >
                      Signed in with Google
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/delivery")}
                    className="custom__button"
                  >
                    Start New Order
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="custom__button"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {paginatedFrequent.length > 0 && (
                <div className="bg-gray-900 border border-golden rounded-lg p-4">
                  <h3 className="p__cormorant text-2xl mb-3">Most ordered</h3>
                  <p
                    className="p__opensans text-sm mb-4"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Your go-to picks, based on recent orders.
                  </p>
                  <ul className="space-y-3">
                    {paginatedFrequent.map((item) => (
                      <li
                        key={`${item.menuItemId || item.name}-${
                          item.size || "std"
                        }-${item.lastOrderedAt}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-black border border-golden rounded-md"
                      >
                        <div>
                          <p className="p__opensans">
                            {item.name} {item.size ? `(${item.size})` : ""}
                          </p>
                          <p
                            className="p__opensans text-xs"
                            style={{ color: "var(--color-grey)" }}
                          >
                            Ordered {item.totalQuantity} times · Last on {" "}
                            {new Date(item.lastOrderedAt).toLocaleDateString()}
                          </p>
                          {item.selectedOptions?.length > 0 && (
                            <ul
                              className="p__opensans text-xs mt-2 space-y-1"
                              style={{ color: "var(--color-grey)" }}
                            >
                              {item.selectedOptions.map((opt) => (
                                <li key={opt.id}>
                                  {opt.name}
                                  {parseFloat(opt.price || 0) > 0
                                    ? ` (+${formatCurrency(
                                        opt.price,
                                        i18n.language
                                      )})`
                                    : ""}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickReorder({
                              menu_item_id: item.menuItemId,
                              name: item.name,
                              price: item.price,
                              size: item.size,
                              quantity: item.quantity || 1,
                              selected_options: item.selectedOptions,
                            })
                          }
                          className="custom__button self-start sm:self-auto"
                        >
                          Reorder
                        </button>
                      </li>
                    ))}
                  </ul>
                  {renderPagination(
                    frequentPage,
                    frequentTotalPages,
                    () => setFrequentPage((p) => Math.max(1, p - 1)),
                    () => setFrequentPage((p) => Math.min(frequentTotalPages, p + 1))
                  )}
                </div>
              )}

              <div className="bg-gray-900 border border-golden rounded-lg p-4">
                <h3 className="p__cormorant text-2xl mb-3">Your Orders</h3>
                {ordersLoading ? (
                  <p className="p__opensans">Loading...</p>
                ) : paginatedOrders.length ? (
                  <ul className="space-y-4">
                    {paginatedOrders.map((o) => (
                      <li
                        key={o.id}
                        className="p-4 bg-black border border-golden rounded-md space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="p__opensans">
                              Order #{o.id} ·{" "}
                              {new Date(
                                o.created_at || o.createdAt
                              ).toLocaleString()}
                            </p>
                            <p
                              className="p__opensans text-sm"
                              style={{ color: "var(--color-grey)" }}
                            >
                              Status: {o.status}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReorder(o)}
                            className="custom__button self-start sm:self-auto"
                          >
                            Reorder whole order
                          </button>
                        </div>
                        {o.items?.length > 0 && (
                          <ul className="space-y-2">
                            {o.items.map((it, idx) => (
                              <li
                                key={`${o.id}-${idx}`}
                                className="p__opensans text-sm flex justify-between gap-4"
                                style={{ color: "var(--color-grey)" }}
                              >
                                <div>
                                  {it.quantity} × {it.name}{" "}
                                  {it.size ? `(${it.size})` : ""}
                                  {Array.isArray(it.selected_options) &&
                                    it.selected_options.length > 0 && (
                                      <ul className="text-xs mt-1 ml-4 space-y-1">
                                        {it.selected_options.map((opt) => (
                                          <li key={opt.id}>
                                            {opt.name}
                                            {parseFloat(opt.price || 0) > 0
                                              ? ` (+${formatCurrency(
                                                  opt.price,
                                                  i18n.language
                                                )})`
                                              : ""}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                                <div>
                                  {formatCurrency(it.price, i18n.language)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p__opensans">
                    No orders found yet. Place a delivery order to start
                    building history.
                  </p>
                )}
                {renderPagination(
                  ordersPage,
                  ordersTotalPages,
                  () => setOrdersPage((p) => Math.max(1, p - 1)),
                  () => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
