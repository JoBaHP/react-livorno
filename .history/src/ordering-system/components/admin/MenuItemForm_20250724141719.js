import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function MenuItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    item || {
      name: "",
      category: "",
      description: "",
      available: true,
      price: "",
      sizes: [],
    }
  );
  const [hasSizes, setHasSizes] = useState(!!item?.sizes?.length);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () =>
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { name: "", price: "" }],
    }));
  const removeSize = (index) =>
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));

  const toggleHasSizes = () => {
    const isSwitchingToSizes = !hasSizes;
    setHasSizes(isSwitchingToSizes);
    if (isSwitchingToSizes) {
      setFormData((prev) => ({
        ...prev,
        price: "",
        sizes: [{ name: "Regular", price: "" }],
      }));
    } else {
      setFormData((prev) => ({ ...prev, price: "", sizes: [] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (hasSizes) {
      delete dataToSave.price;
      dataToSave.sizes = dataToSave.sizes.map((s) => ({
        ...s,
        price: parseFloat(s.price),
      }));
    } else {
      delete dataToSave.sizes;
      dataToSave.price = parseFloat(dataToSave.price);
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {item ? "Edit" : "Add"} Menu Item
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <FormInput
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="flex items-center gap-4">
            <label className="font-medium">Pricing:</label>
            <button
              type="button"
              onClick={toggleHasSizes}
              className={`px-3 py-1 rounded-full text-sm ${
                !hasSizes ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              Single Price
            </button>
            <button
              type="button"
              onClick={toggleHasSizes}
              className={`px-3 py-1 rounded-full text-sm ${
                hasSizes ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              Multiple Sizes
            </button>
          </div>
          {!hasSizes ? (
            <FormInput
              name="price"
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
            />
          ) : (
            <div className="space-y-2 border p-3 rounded-md">
              <h4 className="font-semibold">Sizes</h4>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FormInput
                    placeholder="Size Name"
                    value={size.name}
                    onChange={(e) =>
                      handleSizeChange(index, "name", e.target.value)
                    }
                    required
                  />
                  <FormInput
                    placeholder="Price"
                    type="number"
                    value={size.price}
                    onChange={(e) =>
                      handleSizeChange(index, "price", e.target.value)
                    }
                    required
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="text-red-500 p-2 hover:bg-red-100 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="text-sm text-indigo-600 font-semibold mt-2"
              >
                Add Size
              </button>
            </div>
          )}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="available"
              className="ml-2 block text-sm text-gray-900"
            >
              Item is Available
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FormInput = ({ label, ...props }) => (
  <div className="flex-grow">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      {...props}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);
