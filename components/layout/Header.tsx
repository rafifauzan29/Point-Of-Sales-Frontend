"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

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
      const res = await api.get("/api/init");

      if (res?.status) {
        setNamaToko(res.data?.toko?.nama_toko);
      }
    } catch (err: any) {
      console.error("Gagal ambil nama toko:", err.message);
      setNamaToko("Nama Toko");
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);

      const res = await api.get("/api/logout");

      if (res?.status) {
        showSuccess("Logout berhasil");

        setTimeout(() => {
          router.push("/login");
        }, 800);
      } else {
        showError("Gagal logout");
      }
    } catch (err) {
      showError("Terjadi kesalahan saat logout");
    } finally {
      setLoadingLogout(false);
      setOpenModal(false);
    }
  };

  return (
    <>
      <header className="w-full h-18 bg-white border-b border-gray-200 flex items-center justify-between px-4">

        <Link
          href="/dashboard"
          className="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          {namaToko}
        </Link>

        <button
          onClick={() => setOpenModal(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <i className="mdi mdi-logout text-2xl text-gray-600"></i>
        </button>
      </header>

      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-[340px] rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100">
                  <i className="mdi mdi-logout text-3xl text-red-500"></i>
                </div>
              </div>

              <h5 className="text-center text-gray-800 font-semibold text-lg">
                Logout dari akun?
              </h5>

              <p className="text-center text-gray-500 text-sm mt-2 mb-5">
                Anda akan keluar dari aplikasi ini. Pastikan semua pekerjaan sudah disimpan.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="w-1/2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loadingLogout}
                  className="w-1/2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition"
                >
                  {loadingLogout ? "Memproses..." : "Logout"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}