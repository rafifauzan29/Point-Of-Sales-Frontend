"use client";

import { useEffect, useState } from "react";
import { api, APP_URL } from "@/lib/api";
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

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/init");
      const data = res.data;
      const userData = Array.isArray(data.user) ? data.user[0] : data.user;

      setUser(userData || null);
      setForm(userData || {});

      setAvatarPreview(
        userData?.avatar
          ? `${APP_URL}/assets/images/user/${userData.avatar}`
          : `${APP_URL}/assets/images/user/no-foto.jpg`
      );
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        window.location.href = "/login";
      }
      showError("Gagal memuat data profile");
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event("page-loaded")); 
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
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

      const res = await api.post("/user-update", payload);

      if (res.status) {
        showSuccess("Profile berhasil diperbarui!");
        window.dispatchEvent(new Event("userUpdated"));
        setPassword("");
        setConfirmPassword("");
        fetchProfile();
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

  const handleAvatarChange = async (e: any) => {
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

      const data = await api.post(`/user-avatar/${user.id}`, formData);

      if (data.status) {
        showSuccess("Avatar berhasil diperbarui!");
        window.dispatchEvent(new Event("userUpdated"));
        fetchProfile();
      }
    } catch (err: any) {
      showError(err.message || "Gagal upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
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
  };
}