"use client";

import PageHeader from "@/components/ui/PageHeader";
import { KeyRound, Plus, Trash2, Save, X, AlertCircle, Search, ChevronDown, ChevronRight, Edit, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Access {
  id: number;
  name: string;
  active: number | string;
  created_by?: number;
  created_date?: string;
  updated_by?: number;
  updated_date?: string;
}

interface Menu {
  id: number;
  name: string;
  icon: string;
  route?: string;
  number: number;
  active: number | string;
  submenu?: SubMenu[];
}

interface SubMenu {
  id: number;
  name: string;
  menu_id: number;
  route?: string;
  number: number;
  active: number | string;
}

export default function SettingAccessPage() {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccesses, setSelectedAccesses] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [selectedAccess, setSelectedAccess] = useState<Access | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    active: 1,
  });

  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [selectedSubmenuIds, setSelectedSubmenuIds] = useState<number[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  const filteredAccesses = accesses.filter((access) =>
    access.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentAccesses = filteredAccesses.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAccesses.length / entriesPerPage);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchAccesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/access");
      if (response.status) {
        setAccesses(response.data);
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
        const menusWithSubmenus = await Promise.all(
          response.data.map(async (menu: Menu) => {
            try {
              const submenuRes = await api.get(`/submenus?menu_id=${menu.id}`);
              let submenus = submenuRes.data || [];
              submenus = submenus.filter((sub: SubMenu) => Number(sub.active) === 1);

              return { ...menu, submenu: submenus };
            } catch (err) {
              console.error(`Error fetching submenu for menu ${menu.id}:`, err);
              return { ...menu, submenu: [] };
            }
          })
        );
        setMenus(menusWithSubmenus);
      }
    } catch (error: any) {
      console.error("Gagal memuat menu:", error);
    }
  }, []);

  const fetchAccessDetails = async (accessId: number) => {
    try {
      const response = await api.get(`/access/${accessId}`);
      if (response.status && response.data) {
        setSelectedMenuIds(response.data.menu_ids || []);
        setSelectedSubmenuIds(response.data.submenu_ids || []);
      }
    } catch (error: any) {
      console.error("Gagal memuat detail akses:", error);
    }
  };

  useEffect(() => {
    fetchAccesses();
    fetchMenus();
  }, [fetchAccesses, fetchMenus]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccesses(currentAccesses.map((a) => a.id));
    } else {
      setSelectedAccesses([]);
    }
  };

  const handleSelectAccess = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedAccesses([...selectedAccesses, id]);
    } else {
      setSelectedAccesses(selectedAccesses.filter((a) => a !== id));
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      active: 1,
    });
    setSelectedMenuIds([]);
    setSelectedSubmenuIds([]);
    setExpandedMenus([]);
    setModalAddOpen(true);
  };

  const openEditModal = async (access: Access) => {
    setSelectedAccess(access);
    setFormData({
      name: access.name,
      active: Number(access.active) || 1,
    });
    await fetchAccessDetails(access.id);
    setExpandedMenus([]);
    setModalEditOpen(true);
  };

  const openDetailModal = async (access: Access) => {
    setSelectedAccess(access);
    await fetchAccessDetails(access.id);
    setModalDetailOpen(true);
  };

  const openDeleteModal = () => {
    if (selectedAccesses.length === 0) {
      toast.error("Pilih akses yang akan dihapus");
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

  const handleMenuCheck = (menuId: number, checked: boolean) => {
    if (checked) {
      setSelectedMenuIds([...selectedMenuIds, menuId]);
      const menu = menus.find(m => m.id === menuId);
      if (menu && menu.submenu && menu.submenu.length > 0) {
        const allSubmenuIds = menu.submenu.map(s => s.id);
        setSelectedSubmenuIds([...selectedSubmenuIds, ...allSubmenuIds]);
      }
    } else {
      setSelectedMenuIds(selectedMenuIds.filter((id) => id !== menuId));
      const menu = menus.find(m => m.id === menuId);
      if (menu && menu.submenu && menu.submenu.length > 0) {
        const submenuIdsToRemove = menu.submenu.map(s => s.id);
        setSelectedSubmenuIds(selectedSubmenuIds.filter(id => !submenuIdsToRemove.includes(id)));
      }
    }
  };

  const handleSubmenuCheck = (submenuId: number, checked: boolean, menuId: number) => {
    let newSelectedSubmenuIds = [...selectedSubmenuIds];

    if (checked) {
      newSelectedSubmenuIds.push(submenuId);
    } else {
      newSelectedSubmenuIds = newSelectedSubmenuIds.filter((id) => id !== submenuId);
    }

    setSelectedSubmenuIds(newSelectedSubmenuIds);

    const menu = menus.find(m => m.id === menuId);
    if (menu && menu.submenu && menu.submenu.length > 0) {
      const allSubmenuIds = menu.submenu.map(s => s.id);
      const allSubmenuSelected = allSubmenuIds.every(id => newSelectedSubmenuIds.includes(id));

      if (allSubmenuSelected && !selectedMenuIds.includes(menuId)) {
        setSelectedMenuIds([...selectedMenuIds, menuId]);
      } else if (!allSubmenuSelected && selectedMenuIds.includes(menuId)) {
        setSelectedMenuIds(selectedMenuIds.filter(id => id !== menuId));
      }
    }
  };

  const toggleMenuExpand = (menuId: number) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuFullySelected = (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu || !menu.submenu || menu.submenu.length === 0) {
      return selectedMenuIds.includes(menuId);
    }
    const allSubmenuIds = menu.submenu.map(s => s.id);
    const allSelected = allSubmenuIds.every(id => selectedSubmenuIds.includes(id));
    return allSelected && selectedMenuIds.includes(menuId);
  };

  const isMenuPartiallySelected = (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu || !menu.submenu || menu.submenu.length === 0) return false;
    const allSubmenuIds = menu.submenu.map(s => s.id);
    const someSelected = allSubmenuIds.some(id => selectedSubmenuIds.includes(id));
    const allSelected = allSubmenuIds.every(id => selectedSubmenuIds.includes(id));
    return someSelected && !allSelected;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama akses wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        menu_ids: selectedMenuIds,
        submenu_ids: selectedSubmenuIds,
      };

      const response = await api.post("/access/add", payload);

      if (response && response.status === true) {
        toast.success(response.message || "Akses berhasil ditambahkan");
        setModalAddOpen(false);
        fetchAccesses();
        window.dispatchEvent(new Event("menuUpdated"));
      } else {
        toast.error(response?.message || "Gagal menambahkan akses");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menambahkan akses");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama akses wajib diisi");
      return;
    }

    if (!selectedAccess) return;

    setSubmitting(true);

    try {
      const accessPayload = {
        name: formData.name,
        is_active: formData.active,
      };
      await api.put(`/access/update/${selectedAccess.id}`, accessPayload);

      const currentDetails = await api.get(`/access/${selectedAccess.id}`);
      const currentMenuIds = currentDetails.data?.menu_ids || [];
      const currentSubmenuIds = currentDetails.data?.submenu_ids || [];

      const menusToAdd = selectedMenuIds.filter(id => !currentMenuIds.includes(id));
      for (const menuId of menusToAdd) {
        await api.post("/access/select-menu", { menu_id: menuId, access_id: selectedAccess.id });
      }

      const menusToRemove = currentMenuIds.filter((id: number) => !selectedMenuIds.includes(id));
      for (const menuId of menusToRemove) {
        await api.post("/access/unselect-menu", { menu_id: menuId, access_id: selectedAccess.id });
      }

      const submenusToAdd = selectedSubmenuIds.filter(id => !currentSubmenuIds.includes(id));
      for (const submenuId of submenusToAdd) {
        await api.post("/access/select-submenu", { submenu_id: submenuId, access_id: selectedAccess.id });
      }

      const submenusToRemove = currentSubmenuIds.filter((id: number) => !selectedSubmenuIds.includes(id));
      for (const submenuId of submenusToRemove) {
        await api.post("/access/unselect-submenu", { submenu_id: submenuId, access_id: selectedAccess.id });
      }

      toast.success("Akses berhasil diupdate");
      setModalEditOpen(false);
      fetchAccesses();
      window.dispatchEvent(new Event("menuUpdated"));
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate akses");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = { ids: selectedAccesses };
      const response = await api.delete("/access/delete", payload);
      if (response.status) {
        toast.success(`${selectedAccesses.length} akses berhasil dihapus`);
        setSelectedAccesses([]);
        setModalDeleteOpen(false);
        fetchAccesses();
        window.dispatchEvent(new Event("menuUpdated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus akses");
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected = currentAccesses.length > 0 && selectedAccesses.length === currentAccesses.length;
  const someSelected = selectedAccesses.length > 0 && selectedAccesses.length < currentAccesses.length;

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
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-24"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="flex gap-2"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /></div></td>
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
          title="Setting Akses"
          subtitle="Pengaturan hak akses aplikasi"
          icon={<KeyRound size={20} />}
          rightContent={
            <span className="text-sm text-gray-500">
              Total Akses: {accesses.length}
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
              Tambah Akses
            </button>
            <button
              onClick={openDeleteModal}
              disabled={selectedAccesses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus ({selectedAccesses.length})
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
                  placeholder="Cari akses..."
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akses
                  </th>
                  <th className="px-4 py-3 w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 w-32 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentAccesses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <KeyRound size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data akses</p>
                        <button
                          onClick={openAddModal}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Tambah akses pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentAccesses.map((access) => (
                    <tr
                      key={access.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      onClick={() => openEditModal(access)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedAccesses.includes(access.id)}
                          onChange={(e) => handleSelectAccess(access.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{access.name}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(access.active) === 1 ? (
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(access);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(access);
                            }}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredAccesses.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, filteredAccesses.length)} dari {filteredAccesses.length} akses
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Tambah Akses Baru</h2>
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
                    Nama Akses <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Contoh: Administrator, Manager, Staff"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Nama role/hak akses untuk pengguna</p>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <h5 className="text-md font-semibold text-gray-800 mb-4">Menu / Sub Menu</h5>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {menus.map((menu) => {
                      const hasSubmenu = menu.submenu && Array.isArray(menu.submenu) && menu.submenu.length > 0;

                      return (
                        <div key={menu.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="flex items-center gap-3 p-3 bg-gray-50">
                            {hasSubmenu ? (
                              <button
                                type="button"
                                onClick={() => toggleMenuExpand(menu.id)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                {expandedMenus.includes(menu.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            ) : (
                              <div className="w-6" />
                            )}

                            <input
                              type="checkbox"
                              id={`add-menu-${menu.id}`}
                              checked={selectedMenuIds.includes(menu.id)}
                              onChange={(e) => handleMenuCheck(menu.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />

                            <label htmlFor={`add-menu-${menu.id}`} className="font-semibold text-gray-800 cursor-pointer flex-1">
                              {menu.name.toUpperCase()}
                            </label>
                          </div>

                          {hasSubmenu && expandedMenus.includes(menu.id) && (
                            <div className="p-3 bg-gray-50/50 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {menu.submenu!.map((sub) => (
                                <div key={sub.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`add-submenu-${sub.id}`}
                                    checked={selectedSubmenuIds.includes(sub.id)}
                                    onChange={(e) => handleSubmenuCheck(sub.id, e.target.checked, menu.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                  />
                                  <label htmlFor={`add-submenu-${sub.id}`} className="text-sm text-gray-700 cursor-pointer">
                                    {sub.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Pilih menu/sub menu yang dapat diakses oleh role ini</p>
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

      {modalEditOpen && selectedAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Edit Akses</h2>
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
                    Kode Akses
                  </label>
                  <input
                    type="text"
                    value={`ACC-${selectedAccess.id}`}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Akses <span className="text-red-500">*</span>
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

                <div className="border-t border-gray-200 pt-5">
                  <h5 className="text-md font-semibold text-gray-800 mb-4">Menu / Sub Menu</h5>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {menus.map((menu) => {
                      const hasSubmenu = menu.submenu && Array.isArray(menu.submenu) && menu.submenu.length > 0;
                      const isPartiallySelected = isMenuPartiallySelected(menu.id);
                      const isFullySelected = isMenuFullySelected(menu.id);

                      return (
                        <div key={menu.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="flex items-center gap-3 p-3 bg-gray-50">
                            {hasSubmenu ? (
                              <button
                                type="button"
                                onClick={() => toggleMenuExpand(menu.id)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                {expandedMenus.includes(menu.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            ) : (
                              <div className="w-6" />
                            )}

                            <input
                              type="checkbox"
                              id={`edit-menu-${menu.id}`}
                              checked={isFullySelected}
                              ref={(input) => {
                                if (input && hasSubmenu) {
                                  input.indeterminate = isPartiallySelected;
                                }
                              }}
                              onChange={(e) => handleMenuCheck(menu.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />

                            <label htmlFor={`edit-menu-${menu.id}`} className="font-semibold text-gray-800 cursor-pointer flex-1">
                              {menu.name.toUpperCase()}
                            </label>
                          </div>

                          {hasSubmenu && expandedMenus.includes(menu.id) && (
                            <div className="p-3 bg-gray-50/50 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {menu.submenu!.map((sub) => (
                                <div key={sub.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`edit-submenu-${sub.id}`}
                                    checked={selectedSubmenuIds.includes(sub.id)}
                                    onChange={(e) => handleSubmenuCheck(sub.id, e.target.checked, menu.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                  />
                                  <label htmlFor={`edit-submenu-${sub.id}`} className="text-sm text-gray-700 cursor-pointer">
                                    {sub.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Pilih menu/sub menu yang dapat diakses oleh role ini</p>
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

      {modalDetailOpen && selectedAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalDetailOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Detail Akses</h2>
              <button
                onClick={() => setModalDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Kode Akses</span>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  ACC-{selectedAccess.id}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nama Akses</span>
                <span className="text-sm font-medium text-gray-800">{selectedAccess.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                {Number(selectedAccess.active) === 1 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    Nonaktif
                  </span>
                )}
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Menu / Sub Menu</span>
                <div className="text-right">
                  {menus
                    .filter(menu => selectedMenuIds.includes(menu.id))
                    .map(menu => (
                      <div key={menu.id} className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">{menu.name}</span>
                        {menu.submenu && menu.submenu.filter(sub => selectedSubmenuIds.includes(sub.id)).length > 0 && (
                          <div className="text-gray-400 text-xs ml-2">
                            {menu.submenu.filter(sub => selectedSubmenuIds.includes(sub.id)).map(sub => sub.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  {selectedMenuIds.length === 0 && selectedSubmenuIds.length === 0 && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setModalDetailOpen(false);
                  openEditModal(selectedAccess);
                }}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Edit size={18} />
                Edit Akses
              </button>
            </div>
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
                Apakah Anda yakin ingin menghapus <strong>{selectedAccesses.length}</strong> akses yang
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