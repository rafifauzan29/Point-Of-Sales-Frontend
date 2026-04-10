"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import {
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/anakbangsa";

interface Submenu {
  name: string;
  route: string;
}

interface Menu {
  name: string;
  route: string;
  icon?: string;
  submenu?: Submenu[];
}

interface User {
  firstname: string;
  lastname: string;
  avatar?: string;
  access_name?: string;
}

/* 🔥 FIX MDI LAMA → BARU */
const iconMap: Record<string, string> = {
  "mdi-action-dashboard": "mdi-view-dashboard",
  "mdi-action-settings": "mdi-cog",
  "mdi-action-wallet-travel": "mdi-wallet-travel",
  "mdi-action-add-shopping-cart": "mdi-cart-plus",
  "mdi-action-list": "mdi-format-list-bulleted",
  "mdi-notification-event-note": "mdi-calendar-text",
  "mdi-action-assignment": "mdi-clipboard-text",
};

const getIconClass = (icon?: string) => {
  return `mdi ${iconMap[icon || ""] || "mdi-view-dashboard"}`;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [menu, setMenu] = useState<Menu[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, userRes] = await Promise.all([
        api.get("/api/menu"),
        api.get("/api/user"),
      ]);

      if (menuRes?.status) setMenu(menuRes.data || []);

      if (userRes?.status) {
        const userData = Array.isArray(userRes.data)
          ? userRes.data[0]
          : userRes.data;
        setUser(userData || null);
      }
    } catch (err: any) {
      console.error("Error ambil data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isActive = (route: string) =>
    pathname === `/${route}` || pathname.startsWith(`/${route}/`);

  if (loading) {
    return (
      <aside className="w-64 h-screen bg-white border-r border-gray-200">
        <div className="p-4 animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={
                user?.avatar
                  ? `${BASE_URL}/assets/images/user/${user.avatar}`
                  : `${BASE_URL}/assets/images/user/no-foto.jpg`
              }
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
              alt="avatar"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full ring-2 ring-white"></div>
          </div>

          <p className="font-semibold text-gray-800 text-sm">
            {user?.firstname || "-"} {user?.lastname || ""}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.access_name || "-"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menu.map((item, i) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenus[item.name] || false;

            return (
              <div key={i}>
                {!hasSubmenu ? (
                  <Link
                    href={`/${item.route}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive(item.route)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <i
                      className={`${getIconClass(
                        item.icon
                      )} text-[20px] flex-shrink-0 ${
                        isActive(item.route)
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />

                    <span className="text-sm">{item.name}</span>

                    {isActive(item.route) && (
                      <div className="ml-auto w-1 h-5 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isSubmenuOpen
                          ? "bg-gray-50 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <i
                          className={`${getIconClass(
                            item.icon
                          )} text-[20px] flex-shrink-0 ${
                            isSubmenuOpen
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>

                      {isSubmenuOpen ? (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    <div
                      className={`ml-7 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                        isSubmenuOpen ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      {item.submenu?.map((sub, j) => (
                        <Link
                          key={j}
                          href={`/${sub.route}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive(sub.route)
                              ? "text-blue-700 bg-blue-50/50 font-medium"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive(sub.route)
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}