"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Settings, Plus, Trash2, Save, X, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Menu {
  id: number;
  name: string;
  icon: string;
  route?: string;
  number: number;
  active: number | string;
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

export default function SettingMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    route: "",
    number: 0,
    active: 1,
  });

  const getIconClass = (icon?: string) => {
    const mappedIcon = iconMap[icon || ""] || icon || "mdi-menu";
    return `mdi ${mappedIcon}`;
  };

  const iconOptions = [
    { value: "mdi-view-dashboard", label: "Dashboard" },
    { value: "mdi-cart", label: "Cart" },
    { value: "mdi-account-group", label: "Users" },
    { value: "mdi-cog", label: "Settings" },
    { value: "mdi-chart-line", label: "Chart" },
    { value: "mdi-store", label: "Store" },
    { value: "mdi-tag", label: "Tags" },
    { value: "mdi-file-document", label: "Documents" },
    { value: "mdi-calendar", label: "Calendar" },
    { value: "mdi-email", label: "Email" },
    { value: "mdi-bell", label: "Notifications" },
    { value: "mdi-lock", label: "Security" },
    { value: "mdi-action-dashboard", label: "Action Dashboard" },
    { value: "mdi-action-settings", label: "Action Settings" },
    { value: "mdi-action-wallet-travel", label: "Wallet Travel" },
    { value: "mdi-action-add-shopping-cart", label: "Add Shopping Cart" },
    { value: "mdi-action-list", label: "List" },
    { value: "mdi-notification-event-note", label: "Event Note" },
    { value: "mdi-action-assignment", label: "Assignment" },
  ];

  const getNumberOptions = () => {
    const maxNumber = menus.length + 1;
    const options = [];
    for (let i = 1; i <= maxNumber; i++) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/menus");
      if (response.status) {
        setMenus(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMenus(menus.map((m) => m.id));
    } else {
      setSelectedMenus([]);
    }
  };

  const handleSelectMenu = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedMenus([...selectedMenus, id]);
    } else {
      setSelectedMenus(selectedMenus.filter((m) => m !== id));
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      icon: "",
      route: "",
      number: menus.length + 1,
      active: 1,
    });
    setModalAddOpen(true);
  };

  const openEditModal = (menu: Menu) => {
    setSelectedMenu(menu);
    let originalIcon = menu.icon;
    const reverseMap = Object.fromEntries(
      Object.entries(iconMap).map(([k, v]) => [v, k])
    );
    if (reverseMap[menu.icon]) {
      originalIcon = reverseMap[menu.icon];
    }
    setFormData({
      name: menu.name,
      icon: originalIcon || "",
      route: menu.route || "",
      number: Number(menu.number) || 0,
      active: Number(menu.active) || 1,
    });
    setModalEditOpen(true);
  };

  const openDeleteModal = () => {
    if (selectedMenus.length === 0) {
      toast.error("Pilih menu yang akan dihapus");
      return;
    }
    setModalDeleteOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama menu wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        icon: formData.icon,
        order_no: formData.number,
        route: formData.route,
      };

      const response = await api.post("/menu/add", payload);
      if (response.status) {
        toast.success("Menu berhasil ditambahkan");
        setModalAddOpen(false);
        fetchMenus();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan menu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama menu wajib diisi");
      return;
    }

    if (!selectedMenu) return;

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        icon: formData.icon,
        order_no: formData.number,
        is_active: formData.active,
        route: formData.route || "",
      };

      const response = await api.put(`/menu/update/${selectedMenu.id}`, payload);
      if (response.status) {
        toast.success("Menu berhasil diupdate");
        setModalEditOpen(false);
        fetchMenus();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate menu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = { ids: selectedMenus };
      const response = await api.delete("/menu/delete", payload);
      if (response.status) {
        toast.success(`${selectedMenus.length} menu berhasil dihapus`);
        setSelectedMenus([]);
        setModalDeleteOpen(false);
        fetchMenus();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus menu");
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected = menus.length > 0 && selectedMenus.length === menus.length;
  const someSelected = selectedMenus.length > 0 && selectedMenus.length < menus.length;

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
              <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-12"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-16"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-20"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-24"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-5 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" /></td>
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
          title="Setting Menu"
          subtitle="Pengaturan menu aplikasi"
          icon={<Settings size={20} />}
          rightContent={
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("id-ID")}
            </span>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Tambah Menu
            </button>
            <button
              onClick={openDeleteModal}
              disabled={selectedMenus.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus ({selectedMenus.length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 w-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-4 py-3 w-20 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urutan
                  </th>
                  <th className="px-4 py-3 w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Settings size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data menu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  menus.map((menu) => (
                    <tr
                      key={menu.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      onClick={() => openEditModal(menu)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes(menu.id)}
                          onChange={(e) => handleSelectMenu(menu.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <i className={`${getIconClass(menu.icon)} text-xl text-gray-600`} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{menu.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {menu.route ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {menu.route}
                          </code>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{menu.number}</td>
                      <td className="px-4 py-3 text-center">
                        {Number(menu.active) === 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {menus.length > 0 && (
          <div className="text-sm text-gray-500">
            Menampilkan {menus.length} data menu
          </div>
        )}

        {modalAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalAddOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Tambah Menu Baru</h2>
                <button
                  onClick={() => setModalAddOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Menu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Contoh: Dashboard"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <i className={`${getIconClass(formData.icon)} text-gray-400 text-lg`} />
                      </div>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="">Pilih Icon</option>
                        {iconOptions.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.icon && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg inline-flex items-center gap-2">
                        <i className={`${getIconClass(formData.icon)} text-blue-500`} />
                        <span className="text-sm text-gray-600">Preview icon</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                    <input
                      type="text"
                      name="route"
                      value={formData.route}
                      onChange={handleFormChange}
                      placeholder="Contoh: dashboard"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Route untuk navigasi menu</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                    <select
                      name="number"
                      value={formData.number}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value={0}>Pilih Urutan</option>
                      {getNumberOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label === String(menus.length + 1)
                            ? `${opt.label} (Terakhir)`
                            : opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1.5">Pilih posisi urutan menu</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-8 pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalAddOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalEditOpen && selectedMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalEditOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Edit Menu</h2>
                <button
                  onClick={() => setModalEditOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Menu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <i className={`${getIconClass(formData.icon)} text-gray-400 text-lg`} />
                      </div>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="">Pilih Icon</option>
                        {iconOptions.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.icon && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg inline-flex items-center gap-2">
                        <i className={`${getIconClass(formData.icon)} text-blue-500`} />
                        <span className="text-sm text-gray-600">Preview icon</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                    <input
                      type="text"
                      name="route"
                      value={formData.route}
                      onChange={handleFormChange}
                      placeholder="Contoh: dashboard"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Route untuk navigasi menu</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                    <select
                      name="number"
                      value={formData.number}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {getNumberOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active === 1}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            active: e.target.checked ? 1 : 0,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-8 pt-5 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalEditOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalDeleteOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Konfirmasi Hapus
                </h2>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus <strong>{selectedMenus.length}</strong> menu yang
                  dipilih?
                  <br />
                  <span className="text-red-500 text-sm">
                    Tindakan ini tidak dapat dibatalkan!
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalDeleteOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteSubmit}
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}