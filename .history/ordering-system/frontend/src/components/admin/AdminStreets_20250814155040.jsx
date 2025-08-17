import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { DownloadCloud, Trash2 } from "lucide-react";

export default function AdminStreets() {
  const [streets, setStreets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cityName, setCityName] = useState("Ulcinj, Montenegro"); // Default city
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const api = useApi();

  const fetchStreets = () => {
    setIsLoading(true);
    api
      .getAllStreets()
      .then(setStreets)
      .finally(() => setIsLoading(false));
  };
  useEffect(fetchStreets, [api]);

  const handlePopulateStreets = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await api.populateStreets(cityName);
      setMessage(response.message);
      fetchStreets(); // Refresh the list
    } catch (err) {
      setError("An error occurred while fetching streets.");
    } finally {
      setIsLoading(false);
    }
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
        onSubmit={handlePopulateStreets}
        className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700">
            City or Town Name
          </label>
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="e.g., Ulcinj, Montenegro"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600 disabled:bg-blue-300"
        >
          <DownloadCloud size={18} />{" "}
          {isLoading ? "Populating..." : "Populate Streets"}
        </button>
      </form>
      {message && (
        <p className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</p>
      )}
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
                    className="text-red-600 p-1 hover:bg-red-100 rounded-full"
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
