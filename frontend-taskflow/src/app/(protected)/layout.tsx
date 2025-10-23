// app/(protected)/layout.tsx
"use client";

import "@/app/globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "@/components/Toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function ProtectedContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🚫 Don't render dashboard until auth status is known
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return null; // Prevent showing dashboard while redirecting
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={
                typeof window !== "undefined"
                  ? window.location.pathname
                  : "app"
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Toast />
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
        <AuthProvider>
          <ProtectedContent>{children}</ProtectedContent>
        </AuthProvider>
  );
}
