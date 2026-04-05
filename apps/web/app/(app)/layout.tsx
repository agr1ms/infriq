"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";

import { FiDatabase, FiFolder, FiSun, FiMoon, FiLogOut, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

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
      <aside 
        className={`shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
              <FiDatabase className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <Link href="/dashboard" className="font-bold text-lg text-gray-900 dark:text-white tracking-tight truncate">
                Infriq
              </Link>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform ${isCollapsed ? "group-hover:scale-110" : ""}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-1.5 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 transition-all justify-center`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : ""}
          >
            {theme === "dark" ? (
              <FiSun className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <FiMoon className="w-[18px] h-[18px] shrink-0" />
            )}
            {!isCollapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Sign out" : ""}
          >
            <FiLogOut className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>

          <div className={`flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg border border-gray-200 dark:border-gray-800 transition-all ${
            isCollapsed ? "justify-center border-transparent" : "bg-gray-50/50 dark:bg-gray-900/40"
          }`}>
            <div className={`w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm`}>
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate mt-0.5" title={user.email}>
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">{children}</main>
    </div>
  );
}
