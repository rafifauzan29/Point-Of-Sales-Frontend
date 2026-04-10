"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const [namaToko, setNamaToko] = useState("Loading...");
  const [openModal, setOpenModal] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    fetchNamaToko();
  }, []);

  const fetchNamaToko = async () => {
    try {
      const res = await api.get("/api/toko");

      if (res?.status) {
        setNamaToko(res.data.nama_toko);
      }
    } catch (err: any) {
      console.error("Gagal ambil nama toko:", err.message);
      setNamaToko("Nama Toko");
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);

      await api.get("/api/logout");

      router.push("/login");
    } catch (err) {
      console.error("Logout gagal:", err);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <>
      <header className="w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          {namaToko}
        </Link>

        <button
          onClick={() => setOpenModal(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <i className="mdi mdi-logout text-xl text-gray-600"></i>
        </button>
      </header>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[320px] rounded-xl shadow-lg p-6">
            
            <div className="flex justify-center mb-3">
              <i className="mdi mdi-logout text-4xl text-gray-500"></i>
            </div>

            <h5 className="text-center text-gray-800 font-medium mb-4">
              Apakah anda yakin?
            </h5>

            <div className="flex gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="w-1/2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Batal
              </button>

              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="w-1/2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loadingLogout ? "Loading..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}