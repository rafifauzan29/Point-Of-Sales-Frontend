"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Settings, Plus, Trash2, Save, X, AlertCircle, Menu, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SubMenu {
  id: number;
  name: string;
  menu_id: number;
  menu_name?: string;
  route?: string;
  number: number;
  active: number | string;
}

interface Menu {
  id: number;
  name: string;
}

export default function SettingSubmenuPage() {
  const [submenus, setSubmenus] = useState<SubMenu[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmenus, setSelectedSubmenus] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [selectedSubmenu, setSelectedSubmenu] = useState<SubMenu | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    menu_id: 0,
    route: "",
    number: 0,
    active: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchSubmenus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/submenus");
      if (response.status) {
        setSubmenus(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await api.get("/menus");
      if (response.status) {
        setMenus(response.data);
      }
    } catch (error: any) {
      console.error("Gagal memuat menu:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubmenus();
    fetchMenus();
  }, [fetchSubmenus, fetchMenus]);

  const filteredSubmenus = submenus.filter((submenu) =>
    submenu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (submenu.route && submenu.route.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getMenuName(submenu.menu_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentSubmenus = filteredSubmenus.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredSubmenus.length / entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getSubmenuCountByMenuId = (menuId: number) => {
    return submenus.filter(s => s.menu_id === menuId).length;
  };

  const getNextNumberForMenu = (menuId: number) => {
    const count = getSubmenuCountByMenuId(menuId);
    return count + 1;
  };

  const getNumberOptionsByMenuId = (menuId: number) => {
    const maxNumber = getSubmenuCountByMenuId(menuId) + 1;
    const options = [];
    for (let i = 1; i <= maxNumber; i++) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  };

  const getEditNumberOptionsByMenuId = (menuId: number, excludeId: number) => {
    const count = submenus.filter(s => s.menu_id === menuId && s.id !== excludeId).length;
    const maxNumber = count + 1;
    const options = [];
    for (let i = 1; i <= maxNumber; i++) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmenus(currentSubmenus.map((s) => s.id));
    } else {
      setSelectedSubmenus([]);
    }
  };

  const handleSelectSubmenu = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSubmenus([...selectedSubmenus, id]);
    } else {
      setSelectedSubmenus(selectedSubmenus.filter((s) => s !== id));
    }
  };

  const openAddModal = () => {
    const firstMenuId = menus.length > 0 ? menus[0].id : 0;
    setFormData({
      name: "",
      menu_id: firstMenuId,
      route: "",
      number: firstMenuId > 0 ? getNextNumberForMenu(firstMenuId) : 1,
      active: 1,
    });
    setModalAddOpen(true);
  };

  const openEditModal = (submenu: SubMenu) => {
    setSelectedSubmenu(submenu);
    setFormData({
      name: submenu.name,
      menu_id: submenu.menu_id,
      route: submenu.route || "",
      number: Number(submenu.number) || 0,
      active: Number(submenu.active) || 1,
    });
    setModalEditOpen(true);
  };

  const openDeleteModal = () => {
    if (selectedSubmenus.length === 0) {
      toast.error("Pilih sub menu yang akan dihapus");
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

  useEffect(() => {
    if (modalAddOpen && formData.menu_id > 0) {
      const nextNumber = getNextNumberForMenu(formData.menu_id);
      setFormData(prev => ({ ...prev, number: nextNumber }));
    }
  }, [formData.menu_id, modalAddOpen, submenus]);

  useEffect(() => {
    if (modalEditOpen && selectedSubmenu && formData.menu_id > 0) {
      const maxPossible = getSubmenuCountByMenuId(formData.menu_id) + 1;
      if (formData.number > maxPossible) {
        setFormData(prev => ({ ...prev, number: maxPossible }));
      }
    }
  }, [formData.menu_id, modalEditOpen, selectedSubmenu, submenus]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama sub menu wajib diisi");
      return;
    }

    if (!formData.menu_id || formData.menu_id === 0) {
      toast.error("Pilih menu induk");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        menu_id: formData.menu_id,
        order_no: formData.number,
        route: formData.route,
      };

      const response = await api.post("/submenu/add", payload);
      if (response.status) {
        toast.success("Sub menu berhasil ditambahkan");
        setModalAddOpen(false);
        fetchSubmenus();

        window.dispatchEvent(new Event("menuUpdated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan sub menu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama sub menu wajib diisi");
      return;
    }

    if (!formData.menu_id || formData.menu_id === 0) {
      toast.error("Pilih menu induk");
      return;
    }

    if (!selectedSubmenu) return;

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        menu_id: formData.menu_id,
        order_no: formData.number,
        is_active: formData.active,
        route: formData.route || "",
      };

      const response = await api.put(`/submenu/update/${selectedSubmenu.id}`, payload);
      if (response.status) {
        toast.success("Sub menu berhasil diupdate");
        setModalEditOpen(false);
        fetchSubmenus();

        window.dispatchEvent(new Event("menuUpdated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate sub menu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = { ids: selectedSubmenus };
      const response = await api.delete("/submenu/delete", payload);
      if (response.status) {
        toast.success(`${selectedSubmenus.length} sub menu berhasil dihapus`);
        setSelectedSubmenus([]);
        setModalDeleteOpen(false);
        fetchSubmenus();

        window.dispatchEvent(new Event("menuUpdated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus sub menu");
    } finally {
      setSubmitting(false);
    }
  };

  const getMenuName = (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    return menu ? menu.name : "-";
  };

  const allSelected = currentSubmenus.length > 0 && selectedSubmenus.length === currentSubmenus.length;
  const someSelected = selectedSubmenus.length > 0 && selectedSubmenus.length < currentSubmenus.length;

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
                    <th className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-20"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-24"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-6 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
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
          title="Setting Sub Menu"
          subtitle="Pengaturan sub menu aplikasi"
          icon={<Menu size={20} />}
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
              Tambah Sub Menu
            </button>
            <button
              onClick={openDeleteModal}
              disabled={selectedSubmenus.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus ({selectedSubmenus.length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search sub menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
                />
              </div>
            </div>
          </div>

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
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menu Induk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Menu
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
                {currentSubmenus.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Menu size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data sub menu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentSubmenus.map((submenu, index) => (
                    <tr
                      key={submenu.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      onClick={() => openEditModal(submenu)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedSubmenus.includes(submenu.id)}
                          onChange={(e) => handleSelectSubmenu(submenu.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {indexOfFirstEntry + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {getMenuName(submenu.menu_id)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{submenu.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {submenu.route ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {submenu.route}
                          </code>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{submenu.number}</td>
                      <td className="px-4 py-3 text-center">
                        {Number(submenu.active) === 1 ? (
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

          {filteredSubmenus.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, filteredSubmenus.length)} dari {filteredSubmenus.length} entry
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all ${currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === currentPage - 2 && currentPage > 3) ||
                      (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 py-1.5 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalAddOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Tambah Sub Menu Baru</h2>
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
                    Menu Induk <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="menu_id"
                    value={formData.menu_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    required
                  >
                    <option value={0}>Pilih Menu Induk</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">Menu utama yang menjadi parent</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sub Menu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Contoh: Daftar Menu, Tambah Menu, dll"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleFormChange}
                    placeholder="Contoh: setting-menu"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Route untuk navigasi sub menu</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                  <select
                    name="number"
                    value={formData.number}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {formData.menu_id > 0 && getNumberOptionsByMenuId(formData.menu_id).map((opt) => {
                      const isLast = opt.value === getSubmenuCountByMenuId(formData.menu_id) + 1;
                      return (
                        <option key={opt.value} value={opt.value}>
                          {isLast ? `${opt.label} (Terakhir)` : opt.label}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Urutan sub menu dalam menu induk "{formData.menu_id > 0 ? menus.find(m => m.id === formData.menu_id)?.name : 'Pilih Menu Induk dulu'}"
                  </p>
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

      {modalEditOpen && selectedSubmenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Sub Menu</h2>
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
                    Menu Induk <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="menu_id"
                    value={formData.menu_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    required
                  >
                    <option value={0}>Pilih Menu Induk</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sub Menu <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleFormChange}
                    placeholder="Contoh: setting-menu"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                  <select
                    name="number"
                    value={formData.number}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {selectedSubmenu && getEditNumberOptionsByMenuId(formData.menu_id, selectedSubmenu.id).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Urutan sub menu dalam menu induk "{formData.menu_id > 0 ? menus.find(m => m.id === formData.menu_id)?.name : '-'}"
                  </p>
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
                Apakah Anda yakin ingin menghapus <strong>{selectedSubmenus.length}</strong> sub menu yang
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
  );
}