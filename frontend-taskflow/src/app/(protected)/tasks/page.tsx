//app/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  PlayCircle,
} from "lucide-react";

interface Task {
  id: string;
  name: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed" | string;
  last_run?: string;
}

interface Stats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks`, {
        headers: { "x-api-key": "supersecret123" },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data: Task[] = await res.json();
      setTasks(data);

      const total = data.length;
      const pending = data.filter((t) => t.status === "pending").length;
      const running = data.filter((t) => t.status === "running").length;
      const completed = data.filter((t) => t.status === "completed").length;
      const failed = data.filter((t) => t.status === "failed").length;

      setStats({ total, pending, running, completed, failed });
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      running: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      default: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          colors[status] || colors.default
        }`}
      >
        {status}
      </span>
    );
  };

  const cards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="w-5 h-5" />,
      color: "from-yellow-400 to-yellow-500",
    },
    {
      label: "Running",
      value: stats.running,
      icon: <PlayCircle className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">🧠 Tasks Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Monitor background task performance and execution
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:shadow-md border border-gray-200 transition"
        >
          <RefreshCw
            className={`w-5 h-5 ${
              loading ? "animate-spin text-purple-500" : "text-gray-700"
            }`}
          />
          <span className="text-sm text-gray-700">
            {loading ? "Refreshing..." : `Updated at ${lastUpdate}`}
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">{card.label}</span>
              {card.icon}
            </div>
            <h2 className="text-4xl font-bold">{card.value}</h2>
          </div>
        ))}
      </div>

      

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <td className="px-6 py-3 text-blue-600 font-medium">
                    {t.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3">{t.name}</td>
                  <td className="px-6 py-3">{t.type}</td>
                  <td className="px-6 py-3">{statusBadge(t.status)}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {t.last_run ? new Date(t.last_run).toLocaleString() : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No tasks available. Schedule or run one to see updates.
          </div>
        )}
      </div>
    </div>
  );
}
