import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Plus } from "lucide-react";

export default function AdminOptions() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const api = useApi();

  const fetchOptions = () => {
    setIsLoading(true);
    setError("");
    api
      .getAllOptions()
      .then((data) => {
        if (Array.isArray(data)) {
          setOptions(data);
        } else {
          setError(
            data.message ||
              "Failed to fetch options. Please ensure you are logged in as an admin."
          );
          setOptions([]);
        }
      })
      .catch((err) => {
        console.error("Fetch options error:", err);
        setError("An unexpected error occurred. Please try again.");
        setOptions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(fetchOptions, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.createOption(name, price);
    setName("");
    setPrice(0);
    fetchOptions();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Manage Item Options</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Option Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (0 for free)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Option
        </button>
      </form>

      {isLoading && <p>Loading options...</p>}
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.id} className="border-b">
                  <td className="p-3">{opt.name}</td>
                  <td className="p-3">${parseFloat(opt.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
