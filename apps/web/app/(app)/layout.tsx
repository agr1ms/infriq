"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";

import { FiDatabase, FiFolder, FiSun, FiMoon, FiLogOut, FiLoader } from "react-icons/fi";

/* ── Main Layout ── */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.push("/login");
  }, [user, router]);

  if (user === undefined || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <FiLoader className="animate-spin h-5 w-5" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const displayName = user.name || user.email.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { label: "Projects", href: "/dashboard", icon: FiFolder },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200 dark:border-gray-800">
          <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
            <FiDatabase className="w-4 h-4 text-white" />
          </div>
          <Link href="/dashboard" className="font-semibold text-base text-gray-900 dark:text-white">
            Infriq
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-1">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {theme === "dark" ? (
              <FiSun className="w-[18px] h-[18px]" />
            ) : (
              <FiMoon className="w-[18px] h-[18px]" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <FiLogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>

          {/* User info */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">{children}</main>
    </div>
  );
}
