"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Cpu,
  Power,
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import SkeletonCard from "@/components/SkeletonCard";
import { showToast } from "@/components/Toast";

interface Worker {
  id: string;
  name: string;
  status: "active" | "idle" | "offline" | string;
  current_job?: string;
  uptime?: number;
  last_heartbeat?: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [trendData, setTrendData] = useState<any[]>([]);

  async function fetchWorkers() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/workers`, {
        headers: { "x-api-key": "supersecret123" },
      });

      if (!res.ok) throw new Error("Failed to fetch workers");

      const data: Worker[] = await res.json();
      setWorkers(data);

      // Create uptime trend data (simulated if backend doesn’t yet provide)
      const now = new Date();
      const newTrend = [
        ...trendData.slice(-6),
        {
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          uptime:
            data.length > 0
              ? data.reduce((acc, w) => acc + (w.uptime || 0), 0) / data.length
              : 0,
        },
      ];
      setTrendData(newTrend);

      setLastUpdate(new Date().toLocaleTimeString());
      showToast("✅ Workers refreshed successfully!");
    } catch (error) {
      console.error("Error fetching workers:", error);
      showToast("⚠️ Failed to fetch worker data!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 10000);
    return () => clearInterval(interval);
  }, []);

  const total = workers.length;
  const active = workers.filter((w) => w.status === "active").length;
  const idle = workers.filter((w) => w.status === "idle").length;
  const offline = workers.filter((w) => w.status === "offline").length;

  const pieData = [
    { name: "Active", value: active, color: "#10B981" },
    { name: "Idle", value: idle, color: "#F59E0B" },
    { name: "Offline", value: offline, color: "#EF4444" },
  ];

  const cards = [
    {
      label: "Total Workers",
      value: total,
      icon: <Cpu className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Active",
      value: active,
      icon: <Activity className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Idle",
      value: idle,
      icon: <Clock className="w-5 h-5" />,
      color: "from-yellow-400 to-amber-500",
    },
    {
      label: "Offline",
      value: offline,
      icon: <Power className="w-5 h-5" />,
      color: "from-red-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
            ⚙️ Worker Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor system workers, uptime, and job throughput
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow hover:shadow-md border border-gray-200 transition"
        >
          <RefreshCw
            className={`w-5 h-5 ${
              loading ? "animate-spin text-blue-500" : "text-gray-700"
            }`}
          />
          <span className="text-sm text-gray-700">
            {loading ? "Refreshing..." : `Updated at ${lastUpdate}`}
          </span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <motion.div
                key={card.label}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">{card.label}</span>
                  {card.icon}
                </div>
                <h2 className="text-4xl font-bold">{card.value}</h2>
              </motion.div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Line Chart - Worker Uptime */}
        <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Worker Uptime Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Worker Status */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-green-500" /> Worker Status Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Worker Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Current Job</th>
                <th className="px-6 py-3 font-medium">Uptime</th>
                <th className="px-6 py-3 font-medium">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <motion.tr
                  key={w.id}
                  whileHover={{ backgroundColor: "#F9FAFB" }}
                  className="border-t cursor-pointer transition"
                >
                  <td className="px-6 py-3 text-indigo-600 font-medium">
                    {w.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3">{w.name}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        w.status === "active"
                          ? "bg-green-100 text-green-700"
                          : w.status === "idle"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {w.current_job || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {w.uptime ? `${(w.uptime / 60).toFixed(1)} min` : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {w.last_heartbeat
                      ? new Date(w.last_heartbeat).toLocaleTimeString()
                      : "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {workers.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-400">
            No workers active — start a worker to begin tracking.
          </div>
        )}
      </div>
    </div>
  );
}
