"use client";
import { motion } from "framer-motion";

export default function JobTable({ jobs, onSelect }: any) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-[#0d1117]/70 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="text-gray-400 uppercase bg-gray-900/70">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Task</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job: any, idx: number) => (
            <motion.tr
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelect(job)}
              className="border-t border-gray-800 cursor-pointer hover:bg-gray-800/50 transition"
            >
              <td className="px-4 py-2 text-blue-400">{job.id.slice(0, 8)}</td>
              <td className="px-4 py-2">{job.task}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === "completed"
                      ? "bg-green-800 text-green-200"
                      : job.status === "failed"
                      ? "bg-red-800 text-red-200"
                      : "bg-yellow-700 text-yellow-200"
                  }`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-400">
                {new Date(job.created_at).toLocaleTimeString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
