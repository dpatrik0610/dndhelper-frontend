import { apiClient } from "../api/apiClient";
import type { AuthRequest, AuthResponse, ApiError} from '../types/AuthTypes';

export async function registerUser(request: AuthRequest): Promise<AuthResponse> {
    try {
        const response = await apiClient<AuthResponse>('/Auth/register', {
            method: 'POST',
            body: request,
        });
        return response;
    } catch (err: any) {
        // Try to extract API error message
        const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to register.";

        throw new Error(message);
    }
}

export async function loginUser(request: AuthRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/Auth/login', {
        method: 'POST',
        body: request,
    });
}
