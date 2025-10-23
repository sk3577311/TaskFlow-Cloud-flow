"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const [time, setTime] = useState(new Date());
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark")) || "light"
  );
  const { user, logout } = useAuth();
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // initial health check
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "supersecret123" },
    })
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  }, []);

  const refreshAll = () => {
    // naive: trigger a small fetch for health; UI pages refresh themselves
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`, { method: "GET" })
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-slate-900/60 backdrop-blur sticky top-0 z-40 border-b border-gray-200 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">TaskFlow</div>
        <div className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`text-sm px-3 py-1 rounded-full ${apiOk ? "bg-emerald-600 text-white" : apiOk === false ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}>
          {apiOk === null ? "Checking API..." : apiOk ? "API: Connected" : "API: Offline"}
        </div>

        <button
          onClick={refreshAll}
          title="Refresh"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          title="Toggle theme"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        <button onClick={async () => { await logout(); window.location.href = "/auth"; }} className="bg-white p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition">Logout</button>
      </div>
    </header>
  );
}
