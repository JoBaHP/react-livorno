import React, { useState } from "react";
import { useApi } from "../../ApiProvider";
import { DownloadCloud, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function AdminStreets() {
  const { t } = useTranslation();
  const [isPopulating, setIsPopulating] = useState(false);
  const [cityName, setCityName] = useState("Bijelo Polje, Montenegro");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const api = useApi();
  const queryClient = useQueryClient();
  const { data = { streets: [], pagination: {} }, isLoading } = useQuery({
    queryKey: ["streets", currentPage],
    queryFn: () => api.getAllStreets(currentPage),
    keepPreviousData: true,
  });

  const handlePopulateStreets = async (e) => {
    e.preventDefault();
    setIsPopulating(true);
    setMessage("");
    setError("");
    try {
      const response = await api.populateStreets(cityName);
      setMessage(response.message);
      setCurrentPage(1); // Go back to the first page to see new streets
      await queryClient.invalidateQueries({ queryKey: ["streets"] });
    } catch (err) {
      setError(err.message || "An error occurred while fetching streets.");
    } finally {
      setIsPopulating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this street?")) {
      await api.deleteStreet(id);
      await queryClient.invalidateQueries({ queryKey: ["streets"] });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= data.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-slate-800">
      <h3 className="text-xl font-bold mb-4">{t("admin_streets.title")}</h3>
      <form
        onSubmit={handlePopulateStreets}
        className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700">
            {t("admin_streets.city_label")}
          </label>
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder={t("admin_streets.city_placeholder")}
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
          {isPopulating
            ? t("admin_streets.populating")
            : t("admin_streets.populate")}
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
        <p>{t("admin_streets.loading")}</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">{t("admin_streets.street_name")}</th>
                  <th className="p-3 text-center">
                    {t("admin_streets.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.streets.map((street) => (
                  <tr key={street.id} className="border-b last:border-b-0">
                    <td className="p-3">{street.name}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(t("admin_streets.confirm_delete"))
                          ) {
                            handleDelete(street.id);
                          }
                        }}
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
                {t("admin_streets.prev")}
              </button>
              <span>
                {t("admin_streets.page_of", {
                  current: data.pagination.currentPage,
                  total: data.pagination.totalPages,
                })}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                {t("admin_streets.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
