import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Edit, Trash2 } from "lucide-react";
import MenuItemForm from "./MenuItemForm";
import { formatCurrency } from '../../utils/format';
import ConfirmationModal from "../ConfirmationModal";

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const api = useApi();

  const fetchMenu = () => {
    api.getMenu().then((data) => {
      setMenu(data);
      setIsLoading(false);
    });
  };

  useEffect(fetchMenu, [api]);

  const handleSave = async (item) => {
    setIsLoading(true);
    if (item.id) {
      await api.updateMenuItem(item);
    } else {
      await api.addMenuItem(item);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    fetchMenu();
  };

  const handleDelete = async (itemId) => {
    setIsLoading(true);
    await api.deleteMenuItem(itemId);
    setDeletingItem(null);
    fetchMenu();
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  if (isLoading && !isFormOpen) return <p>Loading menu items...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Menu Items</h3>
        <button
          onClick={() => openForm(null)}
          className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price/Sizes</th>
              <th className="p-3 text-center">Available</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3 text-sm">
                  {item.sizes
                    ? item.sizes
                        .map((s) => `${s.name}: ${formatCurrency(parseFloat(s.price))}`)
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
                    {item.available ? "Yes" : "No"}
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
            ))}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <MenuItemForm
          item={editingItem}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      {deletingItem && (
        <ConfirmationModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deletingItem.name}"?`}
          onConfirm={() => handleDelete(deletingItem.id)}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}
