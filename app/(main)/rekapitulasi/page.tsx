"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Receipt, Calendar, Printer, Eye, TrendingUp, TrendingDown, DollarSign, Building2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface RekapItem {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  total_cash: number;
  total_trf: number;
  grand_total: number;
  total_cash_retur: number;
  total_trf_retur: number;
  grand_total_retur: number;
  net_cash: number;
  net_trf: number;
  net_grand_total: number;
}

interface DetailRekap {
  toko_code: string;
  date: string;
  sales: {
    cash: number;
    transfer: number;
    total: number;
  };
  retur: {
    cash: number;
    transfer: number;
    total: number;
  };
  net: {
    cash: number;
    transfer: number;
    total: number;
  };
}

export default function MasterRekapPage() {
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [selectedToko, setSelectedToko] = useState<RekapItem | null>(null);
  const [detailData, setDetailData] = useState<DetailRekap | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof RekapItem;
    direction: 'asc' | 'desc';
  } | null>(null);

  const fetchRekap = useCallback(async (date?: string) => {
    try {
      setLoading(true);

      let response;
      if (date && date !== new Date().toISOString().split('T')[0]) {
        response = await api.post("/rekap/filter", { date });
      } else {
        response = await api.get("/rekap");
      }

      if (response.status) {
        setRekapData(response.data || []);
        if (response.data?.length === 0) {
          toast.error("Data kosong dari server");
        }
      }
    } catch (error: any) {
      console.error("Error detail:", error);
      toast.error(error.message || "Gagal memuat data rekap");
      setRekapData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRekap();

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchRekap]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchRekap(newDate);
  };

  const handleViewDetail = async (toko: RekapItem) => {
    setSelectedToko(toko);
    setModalDetailOpen(true);
    setLoadingDetail(true);

    try {
      const response = await api.get(`/rekap/detail/${toko.code}?date=${selectedDate}`);

      if (response.status) {
        setDetailData(response.data);
      } else {
        toast.error(response.message || "Gagal memuat detail");
      }
    } catch (error: any) {
      console.error("Detail error:", error);
      toast.error(error.message || "Gagal memuat detail rekap");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rekap/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: selectedDate })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rekap_${selectedDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data berhasil diexport");
      } else {
        toast.error("Gagal export data");
      }
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Gagal export data");
    }
  };
  
  const handleSort = (key: keyof RekapItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (items: RekapItem[]) => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      if (aVal === undefined) aVal = 0;
      if (bVal === undefined) bVal = 0;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ column, label }: { column: keyof RekapItem; label: string }) => {
    const isActive = sortConfig?.key === column;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSort(column);
        }}
        className="inline-flex items-center justify-between w-full hover:text-blue-600 transition-colors group"
      >
        <span>{label}</span>
        <div className="flex flex-col items-center ml-2">
          <span className={`text-[10px] leading-none ${isActive && sortConfig?.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}>
            ▲
          </span>
          <span className={`text-[10px] leading-none ${isActive && sortConfig?.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}>
            ▼
          </span>
        </div>
      </button>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const totalSummary = getSortedData(rekapData).reduce(
    (acc, item) => ({
      totalCash: acc.totalCash + item.net_cash,
      totalTransfer: acc.totalTransfer + item.net_trf,
      totalGrand: acc.totalGrand + item.net_grand_total,
    }),
    { totalCash: 0, totalTransfer: 0, totalGrand: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="px-6 py-8 space-y-6">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-5 w-40 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="px-6 py-8 space-y-6">
        <PageHeader
          title="Rekapitulasi"
          subtitle="Ringkasan transaksi per toko"
          icon={<Receipt size={20} />}
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-sm text-gray-500">
                Total Toko: {rekapData.length}
              </span>
            </div>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              <Printer size={18} />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Cash</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSummary.totalCash)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Transfer</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSummary.totalTransfer)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Grand Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSummary.totalGrand)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    <SortIcon column="name" label="Toko" />
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    <SortIcon column="net_cash" label="Cash" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortIcon column="net_trf" label="Transfer" />
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    <SortIcon column="net_grand_total" label="Jumlah" />
                  </th>
                  <th className="px-4 py-3 w-32 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getSortedData(rekapData).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data transaksi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getSortedData(rekapData).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-all duration-150">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.code}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-gray-700">{formatCurrency(item.net_cash)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-gray-700">{formatCurrency(item.net_trf)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-blue-600">{formatCurrency(item.net_grand_total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {getSortedData(rekapData).length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr className="font-semibold">
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(totalSummary.totalCash)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(totalSummary.totalTransfer)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-blue-600">
                      {formatCurrency(totalSummary.totalGrand)}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {modalDetailOpen && selectedToko && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalDetailOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Detail Rekap</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedToko.name} - {selectedToko.code}</p>
              </div>
              <button
                onClick={() => setModalDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <Receipt size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Memuat detail...</p>
              </div>
            ) : detailData && (
              <div className="p-6 space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(detailData.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-600" />
                    Penjualan
                  </h3>
                  <div className="bg-green-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cash</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.sales.cash)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transfer</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.sales.transfer)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-sm font-semibold text-gray-700">Total Penjualan</span>
                      <span className="text-base font-bold text-green-700">{formatCurrency(detailData.sales.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingDown size={20} className="text-red-600" />
                    Retur
                  </h3>
                  <div className="bg-red-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cash</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.retur.cash)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transfer</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.retur.transfer)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-red-200">
                      <span className="text-sm font-semibold text-gray-700">Total Retur</span>
                      <span className="text-base font-bold text-red-700">{formatCurrency(detailData.retur.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-blue-600" />
                    Net Pendapatan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Net Cash</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.net.cash)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Net Transfer</span>
                      <span className="text-sm font-medium text-gray-800">{formatCurrency(detailData.net.transfer)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="text-base font-semibold text-gray-800">Grand Total</span>
                      <span className="text-xl font-bold text-blue-700">{formatCurrency(detailData.net.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setModalDetailOpen(false)}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}