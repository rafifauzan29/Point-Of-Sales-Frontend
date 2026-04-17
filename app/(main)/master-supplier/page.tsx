"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Truck, Plus, Trash2, Save, X, AlertCircle, Search, Edit, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Supplier {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_date: string;
  created_by: string;
}

export default function MasterSupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("page-loaded"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/supplier");
      if (response.status) {
        setSuppliers(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data supplier");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.phone && supplier.phone.includes(searchTerm)) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredSuppliers.length / entriesPerPage);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(currentSuppliers.map((s) => s.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, id]);
    } else {
      setSelectedSuppliers(selectedSuppliers.filter((s) => s !== id));
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
    });
    setModalAddOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      address: supplier.address || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
    });
    setModalEditOpen(true);
  };

  const openDetailModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setModalDetailOpen(true);
  };

  const openDeleteModal = () => {
    if (selectedSuppliers.length === 0) {
      toast.error("Pilih supplier yang akan dihapus");
      return;
    }
    setModalDeleteOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama supplier wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      const response = await api.post("/supplier/add", payload);
      if (response.status) {
        toast.success("Supplier berhasil ditambahkan");
        setModalAddOpen(false);
        fetchSuppliers();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama supplier wajib diisi");
      return;
    }

    if (!selectedSupplier) return;

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      const response = await api.put(`/supplier/update/${selectedSupplier.code}`, payload);
      if (response.status) {
        toast.success("Supplier berhasil diupdate");
        setModalEditOpen(false);
        fetchSuppliers();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = { ids: selectedSuppliers };
      const response = await api.delete("/supplier/delete", payload);
      if (response.status) {
        toast.success(`${selectedSuppliers.length} supplier berhasil dihapus`);
        setSelectedSuppliers([]);
        setModalDeleteOpen(false);
        fetchSuppliers();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Gagal menghapus supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected = currentSuppliers.length > 0 && selectedSuppliers.length === currentSuppliers.length;
  const someSelected = selectedSuppliers.length > 0 && selectedSuppliers.length < currentSuppliers.length;

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
                    <th className="px-4 py-3 w-24"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-32"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-32 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
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
          title="Master Supplier"
          subtitle="Pengelolaan data supplier"
          icon={<Truck size={20} />}
          rightContent={
            <span className="text-sm text-gray-500">
              Total Supplier: {suppliers.length}
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
              Tambah Supplier
            </button>
            <button
              onClick={openDeleteModal}
              disabled={selectedSuppliers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus ({selectedSuppliers.length})
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
                  placeholder="Cari supplier..."
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
                  <th className="px-4 py-3 w-24 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 w-32 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Truck size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data supplier</p>
                        <button
                          onClick={openAddModal}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Tambah supplier pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      onClick={() => openEditModal(supplier)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={(e) => handleSelectSupplier(supplier.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {supplier.code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{supplier.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {supplier.address ? (
                          <span className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {supplier.address}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {supplier.phone ? (
                          <a href={`tel:${supplier.phone}`} className="text-sm text-blue-600 hover:underline">
                            {supplier.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {supplier.email ? (
                          <a href={`mailto:${supplier.email}`} className="text-sm text-blue-600 hover:underline">
                            {supplier.email}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(supplier);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(supplier);
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

          {filteredSuppliers.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, filteredSuppliers.length)} dari {filteredSuppliers.length} supplier
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
              <h2 className="text-xl font-semibold text-gray-800">Tambah Supplier Baru</h2>
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
                    Nama Supplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Contoh: PT Sumber Makmur"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Jl. Raya No. 123, Jakarta"
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="021-12345678"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="info@sumbermakmur.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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

      {modalEditOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Supplier</h2>
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
                    Kode Supplier
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier.code}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Supplier <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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

      {modalDetailOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalDetailOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Detail Supplier</h2>
              <button
                onClick={() => setModalDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Kode Supplier</span>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {selectedSupplier.code}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nama Supplier</span>
                <span className="text-sm font-medium text-gray-800">{selectedSupplier.name}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Alamat</span>
                <span className="text-sm text-gray-600 text-right max-w-[60%]">
                  {selectedSupplier.address || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Telepon</span>
                <span className="text-sm text-gray-600">{selectedSupplier.phone || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm text-gray-600">{selectedSupplier.email || "-"}</span>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setModalDetailOpen(false);
                  openEditModal(selectedSupplier);
                }}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Edit size={18} />
                Edit Supplier
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
                Apakah Anda yakin ingin menghapus <strong>{selectedSuppliers.length}</strong> supplier yang
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