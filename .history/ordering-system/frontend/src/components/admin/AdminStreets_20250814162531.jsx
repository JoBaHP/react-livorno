import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../ApiProvider";
import { DownloadCloud, Trash2 } from "lucide-react";

export default function AdminStreets() {
  const [data, setData] = useState({ streets: [], pagination: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);
  const [cityName, setCityName] = useState("Ulcinj, Montenegro");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const api = useApi();

  const fetchStreets = useCallback(() => {
    setIsLoading(true);
    api
      .getAllStreets(currentPage)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [api, currentPage]);

  useEffect(fetchStreets, [fetchStreets]);

  const handlePopulateStreets = async (e) => {
    e.preventDefault();
    setIsPopulating(true);
    setMessage("");
    setError("");
    try {
      const response = await api.populateStreets(cityName);
      setMessage(response.message);
      setCurrentPage(1); // Go back to the first page to see new streets
      fetchStreets();
    } catch (err) {
      setError(err.message || "An error occurred while fetching streets.");
    } finally {
      setIsPopulating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this street?")) {
      await api.deleteStreet(id);
      fetchStreets();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= data.pagination.totalPages) {
      setCurrentPage(newPage);
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
          disabled={isPopulating}
          className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600 disabled:bg-blue-300"
        >
          <DownloadCloud size={18} />{" "}
          {isPopulating ? "Populating..." : "Populate Streets"}
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

      {isLoading ? (
        <p>Loading street list...</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Street Name</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.streets.map((street) => (
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
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              <span>
                Page {data.pagination.currentPage} of{" "}
                {data.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
