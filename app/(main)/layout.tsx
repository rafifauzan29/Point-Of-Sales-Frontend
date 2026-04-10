"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      {loading && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 animate-pulse">
              Memuat halaman...
            </p>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40">
        <Header />
      </div>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] fixed top-16 left-0">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}