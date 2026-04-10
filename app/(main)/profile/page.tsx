"use client";

import { useEffect, useState } from "react";
import { api, BASE_URL } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    avatar?: string;
    access_name?: string;
    pob?: string;
    dob?: string;
    address?: string;
    phone?: string;
    gender?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [form, setForm] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/api/init");
            const data = res.data;
            const userData = Array.isArray(data.user) ? data.user[0] : data.user;
            setUser(userData || null);
            setForm(userData || {});

            if (userData?.avatar) {
                setAvatarPreview(`${BASE_URL}/assets/images/user/${userData.avatar}`);
            } else {
                setAvatarPreview(`${BASE_URL}/assets/images/user/no-foto.jpg`);
            }
        } catch (err: any) {
            if (err.message === "Unauthorized") {
                window.location.href = "/login";
            }
            showError("Gagal memuat data profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanPassword = password.trim();
        const cleanConfirm = confirmPassword.trim();

        if (cleanPassword) {
            if (cleanPassword.length < 6) {
                showError("Password minimal 6 karakter");
                return;
            }

            if (cleanPassword !== cleanConfirm) {
                showError("Password tidak sama");
                return;
            }
        }

        setSaving(true);

        try {
            const payload: any = { ...form };

            if (cleanPassword) {
                payload.password = cleanPassword;
                payload.confirm_password = cleanConfirm;
            }

            const res = await api.post("/api/user/update", payload);

            if (res.status) {
                showSuccess("Profile berhasil diperbarui!");
                setPassword("");
                setConfirmPassword("");
                fetchProfile();
            } else {
                showError(res.message || "Gagal memperbarui profile");
            }
        } catch (err: any) {
            if (err.message === "Unauthorized") {
                window.location.href = "/login";
            }
            showError("Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append("filefoto", file);

            const data = await api.post(`/api/user/avatar/${user.id}`, formData);

            if (data.status) {
                showSuccess("Avatar berhasil diperbarui!");
                fetchProfile();
            } else {
                showError(data.message || "Gagal mengupdate avatar");
            }

        } catch (err: any) {
            console.error("UPLOAD ERROR:", err);
            showError(err.message || "Gagal upload avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-10 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-500">Data tidak ditemukan</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Profile Saya</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        {uploadingAvatar && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition cursor-pointer text-sm font-medium">
                            <i className="mdi mdi-camera text-base"></i>
                            Ganti Avatar
                            <input
                                type="file"
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingAvatar}
                            />
                        </label>
                        <p className="text-xs text-gray-400 mt-2">Format: JPG, PNG. Maks 2MB</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            name="username"
                            value={form.username || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            First Name
                        </label>
                        <input
                            name="firstname"
                            value={form.firstname || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Last Name
                        </label>
                        <input
                            name="lastname"
                            value={form.lastname || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tempat Lahir
                        </label>
                        <input
                            name="pob"
                            value={form.pob || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tanggal Lahir
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={form.dob || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            No. Telepon
                        </label>
                        <input
                            name="phone"
                            autoComplete="tel"
                            value={form.phone || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password Baru
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Kosongkan jika tidak ingin mengubah"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ulangi Password
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Alamat
                        </label>
                        <textarea
                            name="address"
                            value={form.address || ""}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jenis Kelamin
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="L"
                                    checked={form.gender === "L"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Laki-laki</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="P"
                                    checked={form.gender === "P"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Perempuan</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <i className="mdi mdi-content-save text-base"></i>
                                Simpan Perubahan
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg transition"
                    >
                        <i className="mdi mdi-refresh text-base mr-1"></i>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}