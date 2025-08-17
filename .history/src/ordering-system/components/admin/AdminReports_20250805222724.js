import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Printer } from "lucide-react";

const getTodayString = () => new Date().toISOString().split("T")[0];

export default function AdminReports() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(getTodayString());
  const api = useApi();

  const generateReport = () => {
    setIsLoading(true);
    setError("");
    setReportData(null);
    api
      .getSalesReport(date)
      .then((data) => {
        if (data.itemsSold && data.dailyTotals) {
          setReportData(data);
        } else {
          setError(data.message || "Could not generate report.");
        }
      })
      .catch(() => setError("An error occurred while generating the report."))
      .finally(() => setIsLoading(false));
  };

  // Generate a report for today on initial component load
  useEffect(() => {
    generateReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Daily Sales Report</h3>

      <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label
            htmlFor="reportDate"
            className="block text-sm font-medium text-gray-700"
          >
            Select Date
          </label>
          <input
            type="date"
            id="reportDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={generateReport}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
        {reportData && (
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700 flex items-center gap-2 ml-auto"
          >
            <Printer size={18} /> Print
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
      )}

      {reportData && (
        <div id="report-content" className="space-y-8">
          {/* --- Key Metrics --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-semibold">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-green-900">
                $
                {parseFloat(reportData.dailyTotals.total_revenue || 0).toFixed(
                  2
                )}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {reportData.dailyTotals.total_orders || 0}
              </p>
            </div>
          </div>

          {/* --- Top Selling Items Chart --- */}
          <div>
            <h4 className="text-lg font-semibold mb-2">
              Top Selling Items (by Quantity)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={reportData.itemsSold}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} units`} />
                <Legend />
                <Bar
                  dataKey="total_quantity"
                  fill="#4f46e5"
                  name="Quantity Sold"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* --- Detailed Sales Table --- */}
          <div>
            <h4 className="text-lg font-semibold mb-2">
              Detailed Sales Breakdown
            </h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Quantity Sold</th>
                    <th className="p-3">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.itemsSold.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.size || "N/A"}</td>
                      <td className="p-3">{item.total_quantity}</td>
                      <td className="p-3">
                        ${parseFloat(item.total_revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
