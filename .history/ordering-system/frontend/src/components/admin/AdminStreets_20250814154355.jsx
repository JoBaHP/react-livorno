import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Plus, Trash2 } from "lucide-react";

export default function AdminStreets() {
  const [streets, setStreets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStreetName, setNewStreetName] = useState("");
  const api = useApi();

  const fetchStreets = () => {
    api
      .getAllStreets()
      .then(setStreets)
      .finally(() => setIsLoading(false));
  };
  useEffect(fetchStreets, [api]);

  const handleAddStreet = async (e) => {
    e.preventDefault();
    await api.createStreet(newStreetName);
    setNewStreetName("");
    fetchStreets();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this street?")) {
      await api.deleteStreet(id);
      fetchStreets();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Manage Delivery Streets</h3>
      <form
        onSubmit={handleAddStreet}
        className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <input
          type="text"
          value={newStreetName}
          onChange={(e) => setNewStreetName(e.target.value)}
          placeholder="New street name"
          required
          className="flex-grow px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          Add Street
        </button>
      </form>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Street Name</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {streets.map((street) => (
              <tr key={street.id} className="border-b last:border-b-0">
                <td className="p-3">{street.name}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(street.id)}
                    className="text-red-600 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
