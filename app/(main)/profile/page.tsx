"use client";

import ProfileSkeleton from "@/components/style/profile/ProfileSkeleton";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
    const {
        user,
        form,
        loading,
        saving,
        avatarPreview,
        uploadingAvatar,
        password,
        confirmPassword,
        setPassword,
        setConfirmPassword,
        handleChange,
        handleSubmit,
        handleAvatarChange,
    } = useProfile();

    if (loading) return <ProfileSkeleton />;

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
                            placeholder="Kosongkan jika tidak ingin mengubah"
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
                </div>
            </form>
        </div>
    );
}