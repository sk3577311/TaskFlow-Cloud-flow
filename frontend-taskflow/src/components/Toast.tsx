"use client";
import { useEffect, useState } from "react";

let globalShow: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  if (globalShow) globalShow(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    globalShow = (m: string) => {
      setMsg(m);
      setTimeout(() => setMsg(null), 4000);
    };
    return () => { globalShow = null; };
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-slate-800 text-white px-4 py-2 rounded shadow-lg">
        {msg}
      </div>
    </div>
  );
}
