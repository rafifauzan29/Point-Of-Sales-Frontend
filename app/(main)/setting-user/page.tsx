"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Users, Plus, Trash2, Save, X, AlertCircle, Search, UserCircle, Store, Lock, KeyRound } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  username: string;
  access_id: number;
  access_name?: string;
  avatar: string | null;
  active: number | string;
  code_toko?: string;
  nama_toko?: string;
  alamat_toko?: string;
  firstname?: string;
  lastname?: string;
  pob?: string;
  dob?: string;
  gender?: string;
  address?: string;
  phone?: string;
  is_login?: number;
}

interface Access {
  id: number;
  name: string;
  active: number;
}

interface Toko {
  code: string;
  name: string;
  address: string;
}

export default function SettingUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [tokos, setTokos] = useState<Toko[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    access_id: 0,
    code_toko: "",
    firstname: "",
    lastname: "",
    pob: "",
    dob: "",
    gender: "L",
    address: "",
    phone: "",
    active: 1,
  });

  const filteredUsers = users.filter((user) =>
    (user.firstname && user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastname && user.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.access_name && user.access_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.nama_toko && user.nama_toko.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      if (response.status) {
        setUsers(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccesses = useCallback(async () => {
    try {
      const response = await api.get("/access");
      if (response.status) {
        setAccesses(response.data);
      }
    } catch (error: any) {
      console.error("Gagal memuat akses:", error);
    }
  }, []);

  const fetchTokos = useCallback(async () => {
    try {
      const response = await api.get("/toko");
      if (response.status) {
        setTokos(response.data);
      }
    } catch (error: any) {
      console.error("Gagal memuat toko:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAccesses();
    fetchTokos();
  }, [fetchUsers, fetchAccesses, fetchTokos]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(currentUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    }
  };

  const openAddModal = () => {
    setFormData({
      username: "",
      password: "",
      confirm_password: "",
      access_id: 0,
      code_toko: "",
      firstname: "",
      lastname: "",
      pob: "",
      dob: "",
      gender: "L",
      address: "",
      phone: "",
      active: 1,
    });
    setModalAddOpen(true);
  };

  const openEditModal = async (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      confirm_password: "",
      access_id: user.access_id,
      code_toko: user.code_toko || "",
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      pob: user.pob || "",
      dob: user.dob || "",
      gender: user.gender || "L",
      address: user.address || "",
      phone: user.phone || "",
      active: Number(user.active) || 1,
    });
    setModalEditOpen(true);
  };

  const openDeleteModal = () => {
    if (selectedUsers.length === 0) {
      toast.error("Pilih user yang akan dihapus");
      return;
    }
    setModalDeleteOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username wajib diisi");
      return;
    }

    if (!formData.password) {
      toast.error("Password wajib diisi");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    if (!formData.access_id || formData.access_id === 0) {
      toast.error("Pilih level akses");
      return;
    }

    if (!formData.firstname.trim()) {
      toast.error("Nama depan wajib diisi");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("No. HP wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        access_id: formData.access_id,
        toko_id: formData.code_toko || null,
        firstname: formData.firstname,
        lastname: formData.lastname,
        pob: formData.pob,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone,
      };

      const response = await api.post("/user/add", payload);
      if (response.status) {
        toast.success("User berhasil ditambahkan");
        setModalAddOpen(false);
        fetchUsers();
        window.dispatchEvent(new Event("menuUpdated"));
      } else {
        toast.error(response.message || "Gagal menambahkan user");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username wajib diisi");
      return;
    }

    if (!formData.access_id || formData.access_id === 0) {
      toast.error("Pilih level akses");
      return;
    }

    if (!formData.firstname.trim()) {
      toast.error("Nama depan wajib diisi");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("No. HP wajib diisi");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    if (!selectedUser) return;

    setSubmitting(true);

    try {
      const payload: any = {
        username: formData.username,
        access_id: formData.access_id,
        toko_id: formData.code_toko || null,
        firstname: formData.firstname,
        lastname: formData.lastname,
        pob: formData.pob,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone,
        active: formData.active,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await api.put(`/user/update/${selectedUser.id}`, payload);
      if (response.status) {
        toast.success("User berhasil diupdate");
        setModalEditOpen(false);
        fetchUsers();
        window.dispatchEvent(new Event("menuUpdated"));
      } else {
        toast.error(response.message || "Gagal mengupdate user");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = { ids: selectedUsers };
      const response = await api.delete("/user/delete", payload);
      if (response.status) {
        toast.success(`${selectedUsers.length} user berhasil dihapus`);
        setSelectedUsers([]);
        setModalDeleteOpen(false);
        fetchUsers();
        window.dispatchEvent(new Event("menuUpdated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus user");
    } finally {
      setSubmitting(false);
    }
  };

  const getFullName = (user: User) => {
    const first = user.firstname || "";
    const last = user.lastname || "";
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (last) return last;
    return user.username;
  };

  const getAvatarUrl = (avatar: string | null) => {
    if (avatar) {
      return `https://beta.anakbangsaelektronik.com/assets/images/user/${avatar}`;
    }
    return "https://beta.anakbangsaelektronik.com/assets/images/user/no-foto.jpg";
  };

  const allSelected = currentUsers.length > 0 && selectedUsers.length === currentUsers.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < currentUsers.length;

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
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-16"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></th>
                    <th className="px-4 py-3 w-16"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-8 bg-gray-200 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-8 bg-gray-200 rounded-full animate-pulse" /></td>
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
          title="Setting User"
          subtitle="Pengaturan user aplikasi"
          icon={<Users size={20} />}
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
              Tambah User
            </button>
            <button
              onClick={openDeleteModal}
              disabled={selectedUsers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus ({selectedUsers.length})
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
                  placeholder="Search user..."
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
                  <th className="px-4 py-3 w-16 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-3 w-28 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toko
                  </th>
                  <th className="px-4 py-3 w-16 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login
                  </th>
                  <th className="px-4 py-3 w-16 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktif
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={48} className="text-gray-300" />
                        <p className="text-sm">Belum ada data user</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                      onClick={() => openEditModal(user)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt={getFullName(user)}
                          className="w-10 h-10 rounded-full object-cover mx-auto"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{getFullName(user)}</div>
                        <div className="text-xs text-gray-400">{user.username}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          <KeyRound size={12} />
                          {user.access_name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.nama_toko ? (
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">{user.nama_toko}</div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{user.alamat_toko}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(user.is_login) === 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                            Y
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                            N
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(user.active) === 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                            Y
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                            N
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, filteredUsers.length)} dari {filteredUsers.length} entry
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
              <h2 className="text-xl font-semibold text-gray-800">Tambah User Baru</h2>
              <button
                onClick={() => setModalAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      placeholder="Contoh: admin_user"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level Akses <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="access_id"
                      value={formData.access_id}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      required
                    >
                      <option value={0}>Pilih Level Akses</option>
                      {accesses.map((access) => (
                        <option key={access.id} value={access.id}>
                          {access.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleFormChange}
                      placeholder="Ulangi password"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Toko</label>
                  <select
                    name="code_toko"
                    value={formData.code_toko}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Pilih Toko</option>
                    {tokos.map((toko) => (
                      <option key={toko.code} value={toko.code}>
                        {toko.name} | {toko.address}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">Toko tempat user bekerja (opsional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleFormChange}
                      placeholder="Nama depan"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleFormChange}
                      placeholder="Nama belakang"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
                    <input
                      type="text"
                      name="pob"
                      value={formData.pob}
                      onChange={handleFormChange}
                      placeholder="Contoh: Jakarta"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="L"
                        checked={formData.gender === "L"}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="P"
                        checked={formData.gender === "P"}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Perempuan</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Alamat lengkap"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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

      {modalEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalEditOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
              <button
                onClick={() => setModalEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level Akses <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="access_id"
                      value={formData.access_id}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      required
                    >
                      <option value={0}>Pilih Level Akses</option>
                      {accesses.map((access) => (
                        <option key={access.id} value={access.id}>
                          {access.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Kosongkan jika tidak diubah"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Minimal 6 karakter</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleFormChange}
                      placeholder="Ulangi password baru"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Toko</label>
                  <select
                    name="code_toko"
                    value={formData.code_toko}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Pilih Toko</option>
                    {tokos.map((toko) => (
                      <option key={toko.code} value={toko.code}>
                        {toko.name} | {toko.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
                    <input
                      type="text"
                      name="pob"
                      value={formData.pob}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="L"
                        checked={formData.gender === "L"}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="P"
                        checked={formData.gender === "P"}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Perempuan</span>
                    </label>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
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
                Apakah Anda yakin ingin menghapus <strong>{selectedUsers.length}</strong> user yang
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