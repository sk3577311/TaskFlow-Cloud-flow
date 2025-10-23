"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Activity,
  Cpu,
  Layers,
  Gauge,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartLegend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Job {
  id: string;
  task: string;
  status: "queued" | "completed" | "failed" | "processing" | string;
  created_at?: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);


  // ✅ Auth hook
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ✅ Redirect to /login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`, {
        headers: { "x-api-key": "supersecret123" },
      });
      const data = await res.json();
      setJobs(data);

      const grouped = data.reduce(
        (acc: any, job: Job) => {
          const time = new Date(job.created_at || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          if (!acc[time]) acc[time] = { time, completed: 0, failed: 0 };
          if (job.status === "completed") acc[time].completed++;
          if (job.status === "failed") acc[time].failed++;
          return acc;
        },
        {}
      );

      setChartData(Object.values(grouped));
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = jobs.length;
  const queued = jobs.filter((j) => j.status === "queued").length;
  const completed = jobs.filter((j) => j.status === "completed").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const processing = jobs.filter((j) => j.status === "processing").length;

  const pieData = [
    { name: "Completed", value: completed, color: "#10B981" },
    { name: "Failed", value: failed, color: "#EF4444" },
    { name: "Queued", value: queued, color: "#F59E0B" },
    { name: "Processing", value: processing, color: "#3B82F6" },
  ];

  const metricCards = [
    {
      label: "Total Jobs",
      value: total,
      icon: <Layers className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Queued",
      value: queued,
      icon: <Clock className="w-6 h-6" />,
      color: "from-yellow-400 to-yellow-500",
    },
    {
      label: "Completed",
      value: completed,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Failed",
      value: failed,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-red-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Gauge className="w-7 h-7 text-indigo-500" />
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm">
            Real-time monitoring of your job queues and system performance.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw
            className={`w-5 h-5 ${loading ? "animate-spin text-indigo-500" : "text-gray-700"}`}
          />
          <span className="text-sm">
            {loading ? "Refreshing..." : `Updated ${lastUpdate}`}
          </span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative p-6 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">{card.label}</span>
                {card.icon}
              </div>
              <h2 className="text-4xl font-semibold">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2 hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Job Completion Trend
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <RechartLegend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Activity className="w-5 h-5 text-green-500" />
              Job Status Breakdown
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent as number * 100).toFixed(0)}%`
                }
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

      {/* System Health Section (Bonus) */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Worker Utilization", value: "82%", icon: Cpu, color: "text-indigo-500" },
          { label: "Average Latency", value: "220ms", icon: Activity, color: "text-green-500" },
          { label: "Throughput", value: "120 jobs/min", icon: TrendingUp, color: "text-rose-500" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-gray-500 text-sm">{metric.label}</p>
              <h3 className="text-2xl font-semibold mt-1">{metric.value}</h3>
            </div>
            <metric.icon className={`w-7 h-7 ${metric.color}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
