// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/auth") {
      router.replace("/auth");
    } else if (user && pathname === "/auth") {
      router.replace("/");
    }
  }, [user, pathname, router]);

  // Optional: while redirecting, show nothing to prevent flicker
  if (!user && pathname !== "/auth") return null;

  return <>{children}</>;
}
