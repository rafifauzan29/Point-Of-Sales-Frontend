"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Settings } from "lucide-react";
import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="px-6 py-8 space-y-6">

        <PageHeader
          title="Kategori"
          subtitle="Pengaturan kategori"
          icon={<Settings size={20} />}
          rightContent={
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("id-ID")}
            </span>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
          
          <h2 className="font-semibold text-gray-800 mb-2">
            🚧 Dalam Pengembangan
          </h2>

          <p className="text-sm text-gray-500">
            Fitur kategori sedang dalam proses pengembangan dan akan segera tersedia.
          </p>

        </div>

      </div>
    </div>
  );
}
