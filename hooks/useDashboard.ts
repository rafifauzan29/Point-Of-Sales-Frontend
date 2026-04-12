"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface DashboardData {
  today: {
    omset: number;
    transaksi: number;
  };
  master: {
    produk: number;
    supplier: number;
  };
  keuangan: {
    total_belanja: number;
    total_modal: number;
  };
  summary_toko: {
    name: string;
    total: number;
  }[];
  top_produk: {
    name: string;
    total: number;
  }[];
  chart: {
    bulan: string;
    total: number;
  }[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await api.get<{ data: DashboardData }>("/dashboard");

      setData(res.data);
      setError(false);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(true);
    } finally {
      setLoading(false);

      window.dispatchEvent(new Event("page-loaded"));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    error,
    loading,
    refetch: fetchDashboard, 
  };
}