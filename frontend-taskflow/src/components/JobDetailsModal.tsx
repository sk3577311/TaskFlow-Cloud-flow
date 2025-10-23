"use client";
import { motion } from "framer-motion";

export default function JobDetailsModal({ job, onClose }: any) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#161b22] rounded-2xl shadow-lg p-6 w-full max-w-md border border-gray-700 text-gray-200"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h3 className="text-xl font-semibold mb-4 text-white">Job Details</h3>
        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {job.id}</p>
          <p><strong>Task:</strong> {job.task}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Priority:</strong> {job.priority}</p>
          <p><strong>Payload:</strong></p>
          <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
