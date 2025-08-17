import React, { useState, useEffect, useCallback } from "react";
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
import { Printer, DollarSign, Utensils, Truck } from "lucide-react";

const getTodayString = (format) => {
  const today = new Date();
  if (format === "month") {
    return today.toISOString().slice(0, 7);
  }
  return today.toISOString().split("T")[0];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-700">{`Day: ${new Date(
          label
        ).getDate()}`}</p>
        <p className="text-indigo-600">{`${payload[0].name}: $${parseFloat(
          payload[0].value
        ).toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function AdminReports() {
  const [reportType, setReportType] = useState("daily");
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyDate, setDailyDate] = useState(getTodayString("day"));
  const [monthlyDate, setMonthlyDate] = useState(getTodayString("month"));
  const api = useApi();

  const generateReport = useCallback(() => {
    setIsLoading(true);
    setError("");
    if (reportType === "daily") {
      setDailyData(null);
      api
        .getSalesReport(dailyDate)
        .then((data) =>
          data.itemsSold ? setDailyData(data) : setError(data.message)
        )
        .catch(() => setError("An error occurred."))
        .finally(() => setIsLoading(false));
    } else {
      setMonthlyData(null);
      api
        .getMonthlySalesReport(monthlyDate)
        .then((data) =>
          Array.isArray(data) ? setMonthlyData(data) : setError(data.message)
        )
        .catch(() => setError("An error occurred."))
        .finally(() => setIsLoading(false));
    }
  }, [api, reportType, dailyDate, monthlyDate]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const handlePrint = () => window.print();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Sales Reports</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700"
        >
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="flex border-b mb-6">
        <ReportTabButton
          tabName="daily"
          currentTab={reportType}
          setTab={setReportType}
        >
          Daily Report
        </ReportTabButton>
        <ReportTabButton
          tabName="monthly"
          currentTab={reportType}
          setTab={setReportType}
        >
          Monthly Revenue
        </ReportTabButton>
      </div>

      {reportType === "daily" && (
        <DailyReportView
          date={dailyDate}
          setDate={setDailyDate}
          onGenerate={generateReport}
          isLoading={isLoading}
          data={dailyData}
        />
      )}
      {reportType === "monthly" && (
        <MonthlyReportView
          date={monthlyDate}
          setDate={setMonthlyDate}
          onGenerate={generateReport}
          isLoading={isLoading}
          data={monthlyData}
        />
      )}

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md mt-4">{error}</p>
      )}
    </div>
  );
}

const ReportTabButton = ({ tabName, currentTab, setTab, children }) => (
  <button
    onClick={() => setTab(tabName)}
    className={`px-4 py-2 font-medium border-b-2 ${
      currentTab === tabName
        ? "border-indigo-600 text-indigo-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    {children}
  </button>
);

const DailyReportView = ({ date, setDate, onGenerate, isLoading, data }) => {
  const totalRevenue = parseFloat(data?.dailyTotals?.total_revenue || 0);
  const tableRevenue = parseFloat(data?.dailyTotals?.table_revenue || 0);
  const deliveryRevenue = parseFloat(data?.dailyTotals?.delivery_revenue || 0);

  return (
    <div>
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
          onClick={onGenerate}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>
      {data && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold flex items-center gap-2">
                <DollarSign size={20} /> Total Revenue
              </p>
              <p className="text-4xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold flex items-center gap-2">
                <Utensils size={20} /> Table Revenue
              </p>
              <p className="text-4xl font-bold">${tableRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold flex items-center gap-2">
                <Truck size={20} /> Delivery Revenue
              </p>
              <p className="text-4xl font-bold">
                ${deliveryRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">
              Top Selling Items (by Quantity)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.itemsSold}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="total_quantity"
                  fill="#6366f1"
                  name="Quantity Sold"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                  {data.itemsSold.map((item, index) => (
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
};

const MonthlyReportView = ({ date, setDate, onGenerate, isLoading, data }) => (
  <div>
    <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <label
          htmlFor="reportMonth"
          className="block text-sm font-medium text-gray-700"
        >
          Select Month
        </label>
        <input
          type="month"
          id="reportMonth"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isLoading ? "Generating..." : "Generate Report"}
      </button>
    </div>
    {data && (
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Daily Revenue for{" "}
          {new Date(date + "-02").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickFormatter={(tick) => new Date(tick).getDate()}
            />
            <YAxis tickFormatter={(tick) => `$${tick}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="total_revenue"
              fill="#14b8a6"
              name="Total Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
