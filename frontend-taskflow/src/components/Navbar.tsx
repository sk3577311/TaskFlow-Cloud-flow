"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    </header>
  );
}
