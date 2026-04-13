"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, APP_URL } from "@/lib/api";
import {
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

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
  const pathname = usePathname();
  const [menu, setMenu] = useState<Menu[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/init");
      const data = res.data;
      const userData = Array.isArray(data.user)
        ? data.user[0]
        : data.user;

      setUser(userData || null);
      setMenu(data.menu || []);
    } catch (err: any) {
      console.error("FULL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUserUpdate = () => {
      fetchData();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenu((prev) => (prev === menuName ? null : menuName));
  };

  const isActive = (route: string) =>
    pathname === `/${route}` || pathname.startsWith(`/${route}/`);

  if (loading) {
    return (
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40">
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
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="px-4 py-6 border-b border-gray-100 flex-shrink-0">
        <Link href="/profile">
          <div className="flex flex-col items-center text-center cursor-pointer hover:opacity-80 transition">
            <div className="relative mb-3">
              <img
                src={
                  user?.avatar
                    ? `${APP_URL}/assets/images/user/${user.avatar}`
                    : `${APP_URL}/assets/images/user/no-foto.jpg`
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
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto scrollbar-thin">
          <div className="px-3 py-4">
            <div className="space-y-1">
              {menu.map((item, i) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isSubmenuOpen = openSubmenu === item.name;

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

                          <div className={`transition-transform duration-300 ${
                            isSubmenuOpen ? "rotate-180" : ""
                          }`}>
                            {isSubmenuOpen ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        <div
                          className={`ml-7 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                            isSubmenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                  isActive(sub.route)
                                    ? "bg-blue-500 scale-125"
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
          </div>
        </div>
      </div>
    </aside>
  );
}