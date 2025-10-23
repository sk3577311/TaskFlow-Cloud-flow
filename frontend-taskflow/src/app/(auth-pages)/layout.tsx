// app/(auth)/layout.tsx
"use client";

import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
      {children}
    </div>
  );
}
