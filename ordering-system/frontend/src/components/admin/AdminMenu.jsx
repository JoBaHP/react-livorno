import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2 } from "lucide-react";
import MenuItemForm from "./MenuItemForm";
import { formatCurrency } from "../../utils/format";
import ConfirmationModal from "../ConfirmationModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function AdminMenu() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const api = useApi();
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categorySortAsc, setCategorySortAsc] = useState(true);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [categoryOrderDraft, setCategoryOrderDraft] = useState([]);
  const sortParam = categorySortAsc ? "asc" : "desc";
  const categoryQuery =
    selectedCategory === "all" ? undefined : selectedCategory;
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortParam]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "menu",
      { page, limit: ITEMS_PER_PAGE, category: categoryQuery, sort: sortParam },
    ],
    queryFn: () =>
      api.getMenu({
        mode: "admin",
        page,
        limit: ITEMS_PER_PAGE,
        sort: sortParam,
        category: categoryQuery === undefined ? undefined : categoryQuery,
      }),
    keepPreviousData: true,
  });

  const normalized = useMemo(() => {
    if (Array.isArray(data)) {
      const uniqueCategories = Array.from(
        new Set(
          data.map((item) => (item.category != null ? item.category : null))
        )
      );
      return {
        items: data,
        totalPages: 1,
        total: data.length,
        categories: uniqueCategories.map((name, index) => ({
          name,
          sortOrder: index,
        })),
      };
    }
    return {
      items: data?.items || [],
      totalPages: data?.totalPages || 1,
      total: data?.total || (data?.items ? data.items.length : 0),
      categories: Array.isArray(data?.categories)
        ? data.categories.map((cat, index) =>
            typeof cat === "object" && cat !== null
              ? {
                  name: cat.name ?? null,
                  sortOrder:
                    typeof cat.sortOrder === "number" ? cat.sortOrder : index,
                }
              : {
                  name: cat ?? null,
                  sortOrder: index,
                }
          )
        : [],
    };
  }, [data]);

  const totalPages = normalized.totalPages || 1;
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedMenu = normalized.items || [];
  const categoryOptions = useMemo(() => {
    const map = new Map();
    (normalized.categories || []).forEach((cat) => {
      const key = cat?.name != null ? cat.name : "__null__";
      if (!map.has(key)) {
        map.set(key, {
          name: cat?.name ?? null,
          sortOrder:
            typeof cat?.sortOrder === "number"
              ? cat.sortOrder
              : Number.MAX_SAFE_INTEGER,
        });
      }
    });
    return Array.from(map.entries())
      .map(([value, cat]) => ({
        value,
        label: value === "__null__" ? t("admin_menu.uncategorized") : cat.name,
        sortOrder: cat.sortOrder,
      }))
      .sort((a, b) => {
        if (a.value === "__null__" && b.value !== "__null__") return 1;
        if (b.value === "__null__" && a.value !== "__null__") return -1;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label);
      });
  }, [normalized.categories, t]);

  useEffect(() => {
    if (selectedCategory === "all" || categoryOptions.length === 0) return;
    const exists = categoryOptions.some(
      (cat) => cat.value === selectedCategory
    );
    if (!exists) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    if (!isReorderOpen) return;
    const ordered = categoryOptions
      .filter((option) => option.value !== "__null__")
      .map((option) => option.value);
    setCategoryOrderDraft(ordered);
  }, [isReorderOpen, categoryOptions]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("pagination.previous")}
        </button>
        <span className="text-sm text-slate-500">
          {t("pagination.page_of", { current: page, total: totalPages })}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("pagination.next")}
        </button>
      </div>
    );
  };

  const saveItem = useMutation({
    mutationFn: (item) =>
      item.id ? api.updateMenuItem(item) : api.addMenuItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
  const handleSave = async (item) => {
    await saveItem.mutateAsync(item);
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const deleteItem = useMutation({
    mutationFn: (itemId) => api.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
  const handleDelete = async (itemId) => {
    await deleteItem.mutateAsync(itemId);
    setDeletingItem(null);
  };

  const reorderCategoriesMutation = useMutation({
    mutationFn: (order) => api.reorderCategories(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });

  const moveCategory = (index, direction) => {
    setCategoryOrderDraft((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSaveCategoryOrder = async () => {
    if (categoryOrderDraft.length === 0) {
      setIsReorderOpen(false);
      return;
    }
    try {
      await reorderCategoriesMutation.mutateAsync(categoryOrderDraft);
      setIsReorderOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  if (isLoading && !isFormOpen) return <p>{t("loading_menu_items")}</p>;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{t("admin_menu.title")}</h3>
          <button
            onClick={() => openForm(null)}
            className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 flex items-center gap-2"
          >
            <Plus size={18} />
            {t("admin_menu.add_new")}
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-col">
            <label
              className="text-sm font-medium text-slate-600"
              htmlFor="category-filter"
            >
              {t("admin_menu.filter_category")}
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">{t("admin_menu.all_categories")}</option>
              {categoryOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCategorySortAsc((prev) => !prev)}
              className="px-4 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
            >
              {categorySortAsc
                ? t("admin_menu.sort_category_asc")
                : t("admin_menu.sort_category_desc")}
            </button>
            <button
              type="button"
              onClick={() => setIsReorderOpen(true)}
              className="px-4 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
            >
              {t("admin_menu.reorder_categories")}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-blue">
              <tr>
                <th className="p-3">{t("admin_menu.name")}</th>
                <th className="p-3">{t("admin_menu.category")}</th>
                <th className="p-3">{t("admin_menu.price_sizes")}</th>
                <th className="p-3 text-center">{t("admin_menu.available")}</th>
                <th className="p-3 text-center">{t("admin_menu.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMenu.length > 0 ? (
                paginatedMenu.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      {item.category || t("admin_menu.uncategorized")}
                    </td>
                    <td className="p-3 text-sm">
                      {item.sizes
                        ? item.sizes
                            .map(
                              (s) =>
                                `${s.name}: ${formatCurrency(
                                  parseFloat(s.price)
                                )}`
                            )
                            .join(", ")
                        : formatCurrency(parseFloat(item.price || 0))}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available
                          ? t("admin_menu.yes")
                          : t("admin_menu.no")}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => openForm(item)}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-sm text-slate-500"
                  >
                    {t("admin_menu.no_results")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
        {isFormOpen && (
          <MenuItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        {deletingItem && (
          <ConfirmationModal
            title={t("admin_menu.delete_title")}
            message={t("admin_menu.delete_confirm", {
              name: deletingItem.name,
            })}
            onConfirm={() => handleDelete(deletingItem.id)}
            onCancel={() => setDeletingItem(null)}
          />
        )}
      </div>
      {isReorderOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 mx-4">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">
              {t("admin_menu.reorder_title")}
            </h4>
            <p className="text-sm text-slate-500 mb-4">
              {t("admin_menu.reorder_help")}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categoryOrderDraft.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t("admin_menu.reorder_empty")}
                </p>
              ) : (
                categoryOrderDraft.map((value, index) => {
                  const option = categoryOptions.find(
                    (opt) => opt.value === value
                  );
                  const label = option?.label || value;
                  return (
                    <div
                      key={value}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title={t("admin_menu.reorder_move_up")}
                          onClick={() => moveCategory(index, -1)}
                          disabled={
                            index === 0 || reorderCategoriesMutation.isPending
                          }
                          className="px-2 py-1 rounded-md border border-slate-200 text-sm hover:bg-slate-100 disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          title={t("admin_menu.reorder_move_down")}
                          onClick={() => moveCategory(index, 1)}
                          disabled={
                            index === categoryOrderDraft.length - 1 ||
                            reorderCategoriesMutation.isPending
                          }
                          className="px-2 py-1 rounded-md border border-slate-200 text-sm hover:bg-slate-100 disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {categoryOptions.some((opt) => opt.value === "__null__") && (
              <p className="mt-3 text-xs text-slate-400">
                {t("admin_menu.reorder_uncategorized_hint")}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReorderOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                disabled={reorderCategoriesMutation.isPending}
              >
                {t("admin_menu.reorder_cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryOrder}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={
                  reorderCategoriesMutation.isPending ||
                  categoryOrderDraft.length === 0
                }
              >
                {reorderCategoriesMutation.isPending
                  ? t("admin_menu.reorder_saving")
                  : t("admin_menu.reorder_save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
