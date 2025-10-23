// src/app/layout.tsx
"use client";

import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* ✅ Global AuthProvider (accessible everywhere) */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
