"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "@/components/SkeletonCard";
import { showToast } from "@/components/Toast";

interface Job {
  id: string;
  task: string;
  status: "queued" | "completed" | "failed" | string;
  created_at?: string;
  priority?: string;
}

interface Stats {
  total: number;
  queued: number;
  completed: number;
  failed: number;
}

function JobDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Job Details
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>ID:</strong> {job.id}</p>
          <p><strong>Task:</strong> {job.task}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Created At:</strong> {job.created_at ?? "--"}</p>
          <p><strong>Priority:</strong> {job.priority ?? "Normal"}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    queued: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`, {
        headers: { "x-api-key": "supersecret123" },
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data: Job[] = await res.json();
      setJobs(data);
      setStats({
        total: data.length,
        queued: data.filter((j) => j.status === "queued").length,
        completed: data.filter((j) => j.status === "completed").length,
        failed: data.filter((j) => j.status === "failed").length,
      });
      setLastUpdate(new Date().toLocaleTimeString());
      showToast("✅ Jobs refreshed successfully");
    } catch (error) {
      showToast("⚠️ Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 150000000);
    return () => clearInterval(interval);
  }, []);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      queued: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
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
    { label: "Total Jobs", value: stats.total, icon: <Database className="w-5 h-5" />, color: "from-blue-500 to-indigo-600" },
    { label: "Queued", value: stats.queued, icon: <Clock className="w-5 h-5" />, color: "from-yellow-400 to-amber-500" },
    { label: "Completed", value: stats.completed, icon: <CheckCircle className="w-5 h-5" />, color: "from-green-500 to-emerald-600" },
    { label: "Failed", value: stats.failed, icon: <AlertTriangle className="w-5 h-5" />, color: "from-red-500 to-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">🧩 Job Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time tracking of background jobs</p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-indigo-500" : "text-gray-700"}`} />
          <span className="text-sm text-gray-700">
            {loading ? "Refreshing..." : `Updated at ${lastUpdate}`}
          </span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg transition`}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm opacity-80">{card.label}</span>
                  {card.icon}
                </div>
                <h2 className="text-4xl font-bold">{card.value}</h2>
              </motion.div>
            ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <motion.tr
                  key={job.id}
                  whileHover={{ backgroundColor: "#F9FAFB" }}
                  onClick={() => setSelectedJob(job)}
                  className="border-t cursor-pointer"
                >
                  <td className="px-6 py-3 text-indigo-600 font-medium">
                    {job.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3">{job.task}</td>
                  <td className="px-6 py-3">{statusBadge(job.status)}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {job.created_at ? new Date(job.created_at).toLocaleTimeString() : "--"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && jobs.length === 0 && (
          <div className="p-8 text-center text-gray-400">No jobs found.</div>
        )}
      </div>

      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
