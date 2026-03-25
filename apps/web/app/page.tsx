"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) window.location.href = "/dashboard";
    else window.location.href = "/login";
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
