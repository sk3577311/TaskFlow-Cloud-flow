"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  List,
  Play,
  Users,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/jobs", label: "Jobs", icon: List },
  { href: "/tasks", label: "Tasks", icon: Play },
  { href: "/workers", label: "Workers", icon: Users },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <>
      {/* ✅ Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-65 bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="text-indigo-600 text-2xl font-bold">TF</div>
          <div>
            <div className="font-semibold">TaskFlow</div>
            <div className="text-xs text-gray-400">Queue Monitor</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {nav.map((n) => {
              const active =
                path === n.href || (n.href !== "/" && path?.startsWith(n.href));
              const Icon = n.icon;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-indigo-600" : "text-gray-400"
                      }`}
                    />
                    <span>{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          © 2025 TaskFlow Cloud
        </div>
      </aside>

      {/* ✅ Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <div className="text-indigo-600 text-xl font-bold">TF</div>
          <span className="font-semibold text-gray-800">TaskFlow</span>
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ✅ Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={toggle}
          >
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-indigo-600 text-xl font-bold">TF</div>
                  <span className="font-semibold text-gray-800">TaskFlow</span>
                </div>
                <button
                  onClick={toggle}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-2">
                  {nav.map((n) => {
                    const active =
                      path === n.href ||
                      (n.href !== "/" && path?.startsWith(n.href));
                    const Icon = n.icon;
                    return (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            active
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              active ? "text-indigo-600" : "text-gray-400"
                            }`}
                          />
                          <span>{n.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto pt-5 text-xs text-gray-400 border-t border-gray-100">
                © 2025 TaskFlow Cloud
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
