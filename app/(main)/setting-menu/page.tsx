"use client";

import PageHeader from "@/components/ui/PageHeader";
import { BarChart3 } from "lucide-react";

// import Skeleton from "@/components/style/...";
// import { useSomething } from "@/hooks/useSettingMenu";

export default function SettingMenuPage() {
  // 🔥 kalau pakai hook
  // const { data, loading, error } = useSomething();

  // ❌ error state
  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
  //         <p className="text-gray-700 font-medium">Gagal memuat data</p>
  //         <p className="text-gray-400 text-sm mt-1">Silakan coba lagi nanti</p>
  //       </div>
  //     </div>
  //   );
  // }

  // ❌ loading state
  // if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="px-6 py-8 space-y-6">

        <PageHeader
          title="Judul Halaman"
          subtitle="Deskripsi singkat halaman"
          icon={<BarChart3 size={20} />}
          rightContent={
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("id-ID")}
            </span>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            Section Title
          </h2>

          <div className="text-gray-500 text-sm">
            Konten halaman di sini...
          </div>
        </div>

      </div>
    </div>
  );
}