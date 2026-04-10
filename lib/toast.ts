import toast, { ToastOptions } from "react-hot-toast";

const baseStyle: ToastOptions = {
  duration: 2500,
  position: "top-right",
  style: {
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: "500",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    ...baseStyle,
    style: {
      ...baseStyle.style,
      background: "rgba(34, 197, 94, 0.08)",
      color: "#166534",
      border: "1px solid rgba(34, 197, 94, 0.2)",
    },
    iconTheme: {
      primary: "#22c55e",
      secondary: "#ecfdf5",
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    ...baseStyle,
    duration: 3000,
    style: {
      ...baseStyle.style,
      background: "rgba(239, 68, 68, 0.08)",
      color: "#7f1d1d",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fef2f2",
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    ...baseStyle,
    style: {
      ...baseStyle.style,
      background: "rgba(59, 130, 246, 0.08)",
      color: "#1e3a8a",
      border: "1px solid rgba(59, 130, 246, 0.2)",
    },
    iconTheme: {
      primary: "#3b82f6",
      secondary: "#eff6ff",
    },
  });
};

export const updateSuccess = (id: string, message: string) => {
  toast.success(message, { id });
};

export const updateError = (id: string, message: string) => {
  toast.error(message, { id });
};

export const dismissToast = (id?: string) => {
  toast.dismiss(id);
};