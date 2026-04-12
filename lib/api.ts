export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
    method?: Method;
    body?: any;
    headers?: Record<string, string>;
}

async function apiFetch<T = any>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const isFormData = body instanceof FormData;

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            body: isFormData
                ? body
                : body
                    ? JSON.stringify(body)
                    : undefined,
            headers: {
                Accept: "application/json", 
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...headers,
            },
            credentials: "include",
        });

        if (res.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            throw new Error("Unauthorized");
        }

        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("INVALID JSON:", text);
            throw new Error("Response bukan JSON valid");
        }

        if (!res.ok) {
            throw new Error(data?.message || `HTTP Error ${res.status}`);
        }

        return data;

    } catch (error: any) {
        console.error("API ERROR:", error.message);
        throw error;
    }
}

export const api = {
    get: <T = any>(url: string) => apiFetch<T>(url),

    post: <T = any>(url: string, body?: any) =>
        apiFetch<T>(url, { method: "POST", body }),

    put: <T = any>(url: string, body?: any) =>
        apiFetch<T>(url, { method: "PUT", body }),

    delete: <T = any>(url: string) =>
        apiFetch<T>(url, { method: "DELETE" }),
};

export default api;