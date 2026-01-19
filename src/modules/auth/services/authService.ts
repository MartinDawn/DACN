import type { LoginRequest, RegisterRequest, ServiceResponse } from "../models/auth";

const API_BASE = "/api"; // use relative path so Vite proxy forwards to backend

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<ServiceResponse<T>> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(opts.headers || {}),
		},
		...opts,
	});
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		const json = await res.json();
		return json as ServiceResponse<T>;
	}
	// fallback
	return { success: res.ok, message: res.statusText } as ServiceResponse<T>;
}

export const login = async (data: LoginRequest): Promise<ServiceResponse> => {
	// Backend might expect { username, password } or different keys; adjust if needed.
	return request("/Account/login", {
		method: "POST",
		body: JSON.stringify(data),
	});
};

export const register = async (data: RegisterRequest): Promise<ServiceResponse> => {
	return request("/Account/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
};

export const getGoogleAuthUrl = async (redirectUri: string): Promise<ServiceResponse<{ url: string }>> => {
	// Send redirectUri so backend can redirect back with token in query
	const encoded = encodeURIComponent(redirectUri);
	return request(`/Account/google-auth-url?redirectUri=${encoded}`, {
		method: "GET",
	});
};

export const getProfile = async (token: string): Promise<ServiceResponse> => {
	return request("/Account/me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};
