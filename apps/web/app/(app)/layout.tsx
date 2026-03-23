"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  if (user === undefined || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href="/dashboard" className="font-semibold text-lg">
            DBpilot
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-200">
            Projects
          </Link>
        </nav>
        <div className="p-2 border-t border-gray-700">
          <p className="px-3 py-1 text-sm text-gray-400 truncate" title={user.email}>
            {user.email}
          </p>
          <button
            type="button"
            onClick={() => logout().then(() => router.push("/login"))}
            className="w-full mt-1 px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-800 text-gray-300"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">{children}</main>
    </div>
  );
}
