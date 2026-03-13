const defaultHost = "localhost";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://${defaultHost}:8081/api`;



export async function apiFetch(endpoint: string, options: RequestInit = {}, returnBlob: boolean = false) {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers: Record<string, string> = {
        "Accept": returnBlob ? "*/*" : "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    // Only set Content-Type for JSON body – not for FormData – and only if there's a body at all
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Merge caller-provided headers
    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    // Robust URL construction
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const finalUrl = `${baseUrl}${cleanEndpoint}`;

    let response: Response;
    try {
        console.log(`[apiFetch] Requesting: ${finalUrl}`, options);
        response = await fetch(finalUrl, {
            ...options,
            headers,
        });
    } catch (networkError: any) {
        // Backend unreachable or CORS error – show more detail
        console.error("Network Fetch Error:", networkError);
        throw new Error(`Connection Failed: ${networkError.message || 'The backend might be down or blocking the request.'}`);
    }

    if (!response.ok) {
        let errorMessage = `Server error ${response.status}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorMessage;
        } catch { /* body not JSON */ }
        throw new Error(errorMessage);
    }

    if (returnBlob) return response.blob();

    // Some endpoints return 204 No Content
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
        return null;
    }

    return response.json();
}

export const auth = {
    login: (credentials: any) => apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    }),
    logout: () => apiFetch("/logout", { method: "POST" }),
    me: () => apiFetch("/user"),
    forgotPassword: (email: string) => apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    }),
    resetPassword: (data: any) => apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
    }),
};

// Keep for compatibility but use the enhanced apiFetch internally
export async function apiFetchBlob(endpoint: string) {
    return apiFetch(endpoint, { method: 'GET' }, true);
}
