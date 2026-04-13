"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ShoppingBag, Package, Truck, DollarSign, Store, TrendingUp, Award, Wallet, BarChart3, CircleDollarSign } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DashboardSkeleton from "@/components/style/dashboard/DashboardSkeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { formatRupiah, formatNumber } from "@/utils/format";

export default function DashboardPage() {
  const { data, error, loading } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <p className="text-gray-700 font-medium">Gagal memuat data</p>
          <p className="text-gray-400 text-sm mt-1">Silakan coba lagi nanti</p>
        </div>
      </div>
    );
  }

  if (loading || !data) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="px-6 py-8 space-y-6">
        <div className="mb-4">
          <PageHeader
            title="Dashboard"
            subtitle="Ringkasan performa toko"
            icon={<BarChart3 size={20} />}
            rightContent={
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("id-ID")}
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 font-medium flex items-center gap-2">
                  <CircleDollarSign size={18} />
                  Penjualan Hari Ini
                </p>
                <p className="text-4xl font-bold mt-2">
                  {formatRupiah(data.today.omset)}
                </p>
              </div>

              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium flex items-center gap-2">
                  <ShoppingBag size={18} />
                  Transaksi Hari Ini
                </p>
                <p className="text-4xl font-bold mt-2">
                  {formatNumber(data.today.transaksi)}
                </p>
              </div>

              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShoppingBag size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Produk"
            value={formatNumber(data.master.produk)}
            icon={<Package size={20} />}
            gradient="from-purple-500 to-purple-700"
            bgGradient="from-purple-50 to-purple-100"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Total Supplier"
            value={formatNumber(data.master.supplier)}
            icon={<Truck size={20} />}
            gradient="from-orange-500 to-orange-700"
            bgGradient="from-orange-50 to-orange-100"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            title="Total Belanja Hari Ini"
            value={formatRupiah(data.keuangan.total_belanja)}
            icon={<Wallet size={20} />}
            gradient="from-red-500 to-red-700"
            bgGradient="from-red-50 to-red-100"
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />
          <StatCard
            title="Total Modal Gudang"
            value={formatRupiah(data.keuangan.total_modal)}
            icon={<DollarSign size={20} />}
            gradient="from-blue-500 to-blue-700"
            bgGradient="from-blue-50 to-blue-100"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <h2 className="font-semibold text-gray-800">Penjualan 12 Bulan</h2>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                  <span className="text-xs text-gray-500">Omset</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={data.chart}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={60}
                  padding={{ top: 20, bottom: 20 }}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    const format = new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value);

                    return `Rp${format.replace(".0", "").replace(" ", "")}`;
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "12px",
                    padding: "10px 14px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => [formatRupiah(Number(value || 0)), "Omset"]}
                  labelStyle={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full" />
              <h2 className="font-semibold text-gray-800">Penjualan Toko Per Hari</h2>
            </div>

            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {data.summary_toko.map((toko, idx) => {
                const gradients = [
                  "from-blue-500 to-blue-700",
                  "from-purple-500 to-purple-700",
                  "from-emerald-500 to-emerald-700",
                  "from-orange-500 to-orange-700",
                  "from-pink-500 to-pink-700",
                ];

                const bgGradients = [
                  "from-blue-50 to-blue-100",
                  "from-purple-50 to-purple-100",
                  "from-emerald-50 to-emerald-100",
                  "from-orange-50 to-orange-100",
                  "from-pink-50 to-pink-100",
                ];

                const iconColors = [
                  "text-blue-600",
                  "text-purple-600",
                  "text-emerald-600",
                  "text-orange-600",
                  "text-pink-600",
                ];

                const i = idx % gradients.length;

                return (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${bgGradients[i]} rounded-2xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/50`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {toko.name}
                        </p>
                        <p
                          className={`text-lg font-bold bg-gradient-to-r ${gradients[i]} bg-clip-text text-transparent mt-2`}
                        >
                          {formatRupiah(Number(toko.total))}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white shadow-sm">
                        <Store size={18} className={iconColors[i]} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                <Award size={18} className="text-white" />
              </div>
              <h2 className="font-semibold text-gray-800">Top 10 Produk Terlaris</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.top_produk.map((product, idx) => {
                  const rankColors = [
                    "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
                    "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
                    "bg-gradient-to-r from-orange-400 to-orange-500 text-white",
                    "bg-gray-100 text-gray-600",
                  ];
                  const rankColor = idx < 3 ? rankColors[idx] : rankColors[3];
                  return (
                    <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${rankColor}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-medium text-gray-700">{product.name}</span>
                        {idx === 0 && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🔥 Terlaris</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm">
                          <Package size={12} />
                          {formatNumber(product.total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  bgGradient,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/50`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mt-2`}>
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}